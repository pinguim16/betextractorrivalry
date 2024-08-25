console.log("content.js loaded");
document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('bet-extractor-form');
  const statusDiv = document.getElementById('status');

  form.addEventListener('submit', async (e) => {
      e.preventDefault();
      statusDiv.textContent = 'Iniciando extração...';

      const startDate = document.getElementById('start-date').value;
      const endDate = document.getElementById('end-date').value;

      if (new Date(startDate) > new Date(endDate)) {
          statusDiv.textContent = 'A data de início não pode ser posterior à data de fim.';
          return;
      }

      // Obtém a guia ativa atual
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
          statusDiv.textContent = 'Nenhuma guia ativa encontrada.';
          return;
      }

      // Envia uma mensagem ao background script para iniciar a extração
      chrome.runtime.sendMessage({
          action: 'startExtraction',
          data: {
              tabId: tab.id,
              startDate: startDate,
              endDate: endDate
          }
      }, (response) => {
          if (chrome.runtime.lastError) {
              statusDiv.textContent = 'Erro ao iniciar a extração: ' + chrome.runtime.lastError.message;
          } else if (response && response.success) {
              statusDiv.textContent = 'Extração concluída com sucesso!';
          } else {
              statusDiv.textContent = 'Ocorreu um erro durante a extração.';
          }
      });
  });
});
