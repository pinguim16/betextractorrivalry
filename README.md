# Betting Data Extractor Plugin

Este plugin para Chrome foi projetado para extrair dados de apostas esportivas de páginas web e exportá-los para um arquivo CSV. O plugin filtra as apostas por data e categoriza-as com base em certos critérios, oferecendo uma maneira conveniente de registrar e analisar informações de apostas.

## Funcionalidades

- **Extração de Apostas**: Filtra as apostas dentro de um intervalo de datas especificado.
- **Exportação para CSV**: Os dados das apostas são exportados para um arquivo CSV com todos os detalhes relevantes.
- **Categorização Automática**: O campo "Category" é preenchido automaticamente como "ML" ou "MS" dependendo se a `label` contém a palavra "vencedor".

## Campos Exportados no CSV

O arquivo CSV gerado contém as seguintes colunas:

- `Date`: Data e hora da aposta, no formato `YYYY-MM-DD HH:mm`.
- `Type`: Tipo da aposta (pré-definido como "S").
- `Sport`: Categoria do esporte (pré-definido como "eSport").
- `Label`: Descrição da aposta.
- `Odds`: Odds da aposta.
- `Stake`: Valor apostado.
- `State`: Estado da aposta (Win/Loss).
- `Bookmaker`: Casa de apostas (pré-definido como "Stake").
- `Tipster`: Tipster (em branco por padrão).
- `Category`: Categoria da aposta ("ML" para apostas com a palavra "vencedor" na label e "MS" para as demais).
- `Competition`: Competição (em branco por padrão).
- `BetType`: Tipo de aposta (em branco por padrão).
- `Closing`: Encerramento (em branco por padrão).
- `Commission`: Comissão (em branco por padrão).
- `Live`: Aposta ao vivo (em branco por padrão).
- `Freebet`: Aposta grátis (em branco por padrão).
- `Cashout`: Cashout (em branco por padrão).
- `EachWay`: Cada Caminho (em branco por padrão).
- `Comment`: Comentários adicionais (em branco por padrão).

## Como Funciona

1. **Iniciação**: O plugin é ativado a partir de uma mensagem Chrome com a ação `extractBets`.
2. **Filtragem**: As apostas são filtradas dentro de um intervalo de datas especificado.
3. **Extração**: Os dados das apostas são extraídos da página e processados.
4. **Exportação**: As apostas são exportadas para um arquivo CSV, baixado automaticamente.

## Como Usar

1. Clone este repositório em sua máquina local:
   ```bash
   git clone https://github.com/pinguim16/betextractorrivalry  ```
   
2. Abra o Chrome e vá para chrome://extensions/.

3. Ative o Modo de desenvolvedor no canto superior direito.

4. Clique em Carregar sem compactação e selecione o diretório clonado.

5. O plugin será carregado e estará pronto para uso.

## Contribuições

Sinta-se à vontade para contribuir com melhorias ou correções. Para contribuir:

1. Fork este repositório.
2. Crie uma branch para a sua feature

   ```bash
   git checkout -b feature/nova-feature 
   ```

3. Faça commit de suas alterações:

   ```bash
   git commit -m 'Adiciona nova feature' 
   ```

4. Envie para o GitHub
 
 ```bash
   git commit -m 'Adiciona nova feature' 
   ```



## Licença
Este projeto está licenciado sob a MIT License.

Contato
Para dúvidas ou sugestões, entre em contato pelo cesaraugustosi16@gmail.com.


