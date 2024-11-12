let downloaded = false; // Variável de controle para garantir download único

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'extractionChannel') {
        port.onMessage.addListener(async (msg) => {
            if (msg.action === 'extractBets') {
                const { startDate, endDate } = msg.data;

                try {
                    console.log(`Iniciando extração para intervalo: ${startDate} - ${endDate}`);
                    const data = await extractBets(startDate);
                    if (data.length > 0) {
                        console.log('Dados extraídos com sucesso. Iniciando download do CSV.');
                        downloadCSV(data, port, startDate, endDate); // Passa o startDate e o endDate
                    } else {
                        console.log('Nenhuma aposta encontrada na data selecionada.');
                        port.postMessage({ success: false, message: 'Nenhuma aposta encontrada.' });
                    }
                } catch (error) {
                    console.error('Erro durante a extração:', error);
                    port.postMessage({ success: false, message: error.message });
                }
            }
        });
    }
});

function downloadCSV(data, port, startDate, endDate) {
    if (downloaded) {
        console.log('Download já realizado. Pulando nova tentativa.');
        return; // Evita múltiplos downloads
    }

    const csvHeader = "Date;Type;Sport;Label;Odds;Stake;State;Bookmaker;Tipster;Category;Competition;BetType;Closing;Commission;Live;Freebet;Cashout;EachWay;Comment";
    const csvContent = [csvHeader, ...data].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `bet_rivalry_${startDate}_to_${endDate}.csv`; // Nome atualizado com startDate e endDate
    document.body.appendChild(link);

    console.log('Iniciando o download do CSV.');
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    downloaded = true;
    console.log('Download do CSV concluído.');

    if (port) {
        port.postMessage({ success: true, message: 'Download concluído.' });
    }

    setTimeout(() => {
        downloaded = false;
        console.log('Variável downloaded redefinida para false.');
    }, 1000);
}

async function extractBets(startDate) {
    const bets = [];
    let hasNextPage = true;
    const stopDate = subtractDays(startDate, 2); // Condição de parada (data selecionada - 2 dias)

    console.log(`Data de parada: ${stopDate}`);
    console.log(`Data selecionada para extração: ${startDate}`);

    while (hasNextPage) {
        console.log('Extraindo apostas da página...');
        const pageBets = extractBetsFromPage(startDate); // Extrai apostas apenas da data selecionada
        bets.push(...pageBets);

        const mostRecentBetDate = getMostRecentBetDate();
        console.log(`Data mais recente encontrada na página: ${mostRecentBetDate}`);

        if (mostRecentBetDate) {
            if (mostRecentBetDate < stopDate) {
                console.log('Data mais recente é anterior à data de parada. Parando a navegação.');
                hasNextPage = false;
            } else {
                console.log('Navegando para a próxima página...');
                hasNextPage = await navigateToNextPage();
            }
        } else {
            console.log('Nenhuma data encontrada na página. Navegando para a próxima página...');
            hasNextPage = await navigateToNextPage();
        }
    }

    console.log(`Extração concluída. Número total de apostas extraídas: ${bets.length}`);
    return bets;
}

function extractBetsFromPage(targetDate) {
    const bets = [];
    const betElements = document.querySelectorAll('div.bet-history-item');

    betElements.forEach((betElement) => {
        const dateElement = betElement.querySelector('span.text-xs.text-grey-300');
        const dateText = dateElement ? dateElement.innerText.trim() : null;
        const betDate = parseDate(dateText);

        console.log(`Aposta encontrada com data: ${betDate}`);

        if (betDate && betDate === targetDate) {
            const betData = parseBetData(betElement, betDate);
            if (betData) {
                console.log(`Aposta do dia ${targetDate} adicionada: ${betData}`);
                bets.push(betData);
            }
        }
    });

    return bets;
}

function parseBetData(betElement, betDate) {
    const stateElement = betElement.querySelector('div.status');
    const stateText = stateElement ? stateElement.innerText.trim().toUpperCase() : '';

    if (stateText.includes('A SER DEFINIDO') || stateText.includes('APOSTA ABERTA') || stateText.includes('CANCELADO')) {
        console.log(`Aposta ignorada devido ao status: ${stateText}`);
        return null;
    }

    const state = stateText.includes('VITÓRIA') ? 'W' : 'L';

    const buttonElement = betElement.querySelector('button[type="button"]');
    let label = '';
    let comments = '';

    if (buttonElement) {
        label = buttonElement.innerText.trim();
        const matchVersusElements = betElement.querySelectorAll('a.match-versus span:last-child');
        comments = Array.from(matchVersusElements).map(element => element.innerText.trim()).join(', ');
    } else {
        const eventNameElement = betElement.querySelector('div.ml-2.text-sm.text-white > div.font-bold > span');
        const eventName = eventNameElement ? eventNameElement.innerText.trim() : '';

        const additionalInfoElement = betElement.querySelector('div.ml-2.text-sm.text-white > div:last-child');
        const additionalInfo = additionalInfoElement ? additionalInfoElement.innerText.trim() : '';

        label = `${eventName} - ${additionalInfo}`;
    }

    let category = "MS";
    if (label.toLowerCase().includes('vencedor')) {
        category = "ML";
    }

    let competition = "";
    // Verifica a classe para determinar a competição
    if (betElement.querySelector('span[class*="csgo"]')) {
        competition = "CS";
    } else if (betElement.querySelector('span[class*="dota-2"]')) {
        competition = "Dota";
    } else if (betElement.querySelector('span[class*="league-of-legends"]')) {
        competition = "LOL";
    } else if (betElement.querySelector('span[class*="valorant"]')) {
        competition = "Valorant";
    }

    const valueAndOddsElement = betElement.querySelector('div.flex.items-center.justify-end > span.inline-block.ml-1.text-sm');
    let stake = '0.00';
    let odds = '0.00';

    if (valueAndOddsElement) {
        const text = valueAndOddsElement.innerText.trim();
        const [stakeText, oddsText] = text.split('@').map(item => item.trim());

        stake = stakeText.replace('R$', '').replace(',', '.').trim();
        odds = oddsText.replace(',', '.').trim();
    }

    const formattedBetDate = formatDateForCSV(betDate);

    return [
        formattedBetDate,  // Data
        'S',               // Tipo
        'eSport',          // Esporte
        label,             // Label
        odds,              // Odds
        stake,             // Stake
        state,             // Estado (V/W)
        'Rivalry',         // Casa de aposta
        '',                // Tipster
        category,          // Categoria (ML/MS)
        competition,       // Competição (CS, Dota, LOL, Valorant)
        '',                // Tipo de aposta
        '',                // Fechamento
        '',                // Comissão
        '',                // Ao vivo
        '',                // Aposta grátis
        '',                // Cashout
        '',                // Each way
        comments           // Comentário
    ].join(';');
}


// Função para formatar a data para o CSV
function formatDateForCSV(dateText) {
    if (!dateText) return null;

    const [year, month, day] = dateText.split('-');
    return `${year}-${month}-${day} 00:00`;
}

function getMostRecentBetDate() {
    const dateElements = document.querySelectorAll('span.text-xs.text-grey-300');
    if (dateElements.length > 0) {
        const mostRecentDateText = dateElements[0].innerText.trim();
        return parseDate(mostRecentDateText);
    }
    return null;
}

function parseDate(dateText) {
    if (!dateText) return null;

    const [day, month, year] = dateText.split(' de ').map(item => item.trim());

    const months = {
        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
        'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
        'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
    };

    if (!months[month]) {
        console.error('Mês inválido:', month);
        return null;
    }

    const formattedDate = `${year}-${months[month]}-${day.padStart(2, '0')}`;
    console.log(`Data formatada: ${formattedDate}`);
    return formattedDate;
}


function subtractDays(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() - days);
    const formattedDate = date.toISOString().split('T')[0];
    console.log(`Data após subtração de ${days} dias: ${formattedDate}`);
    return formattedDate;
}

async function navigateToNextPage() {
    try {
        const nextButton = document.querySelector('button[aria-label="Next"]');
        if (nextButton && !nextButton.disabled) {
            nextButton.click();
            console.log('Clique no botão "Next" realizado. Aguardando carregamento da página...');
            await new Promise(resolve => setTimeout(resolve, 5000));  // Espera 5 segundos
            return true;
        }
        console.log('Botão "Next" não encontrado ou está desabilitado.');
        return false;
    } catch (error) {
        console.error('Erro ao tentar navegar para a próxima página:', error);
        return false;
    }
}
