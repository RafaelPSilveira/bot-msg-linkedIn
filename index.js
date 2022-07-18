const puppeteer = require('puppeteer');
const credentials = require('./credentials.json');
let totalbuttonClick = 0;
let navPage = 1;

(async() =>{
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
    await page.goto('https://www.linkedin.com/');  

    await login(page);

    await page.waitForNavigation();

    await paginations(page, navPage)
    if (totalbuttonClick > 0) {
        console.log(`Consegui me conectar com ${totalbuttonClick} pessoas!`);
    }
})();


async function paginations(page,navPage){

    const searchTerm = encodeURI('recursos humanos ti');

    await page.goto(`https://www.linkedin.com/search/results/people/?keywords=${searchTerm}&origin=FACETED_SEARCH&sid=Feu&page=${navPage}`)

    await page.waitForTimeout(5000);  

    const resultsSearchPage = await page.$$('.reusable-search__result-container');
    const getClickableElements = await page.$$('.reusable-search__result-container .entity-result .entity-result__item .entity-result__actions:not(.entity-result__actions--empty)');

    console.log("Resultados: " + resultsSearchPage.length + "Termo pesquisado: " + searchTerm);
    console.log("Resultados conectaveis: " + getClickableElements.length);

    totalbuttonClick += getClickableElements.length;

        for( let cont = 0; cont < resultsSearchPage.length; cont++) {
            const result = resultsSearchPage[cont];
            const block = await result.$('.entity-result__content.entity-result__divider.pt3.pb3.t-12.t-black--light > div.mb1 > div.t-roman.t-sans > div > span.entity-result__title-line.entity-result__title-line--2-lines > span > a > span > span:nth-child(1)');

            if(!block) continue;
            
            let recruitName = (await block.getProperty('innerHTML')).toString();

            const cleanName = recruitName ? recruitName.split("JSHandle:")[1].toString().replace(/<!---->/g,'').replace(/[^a-z0-9 ]/gi, '') : "Error";

            const conectar = await result.$('.entity-result__actions.entity-result__divider > div > button');
            if(!conectar){
                totalbuttonClick--;
                continue;             
            }else{

                const follow = await result.$('[data-test-reusable-search-primary-action]');
                if(follow){
                    continue;
                }else{
                    await conectar.click('.entity-result__actions.entity-result__divider > div > button');                 
                }
                
            }

            
            await page.waitForTimeout(2000);
            
            const textNote = await page.$('[aria-label="Adicionar nota"]');
            await textNote.click('[aria-label="Adicionar nota"]');
            await page.waitForTimeout(2000);
            
            await page.keyboard.type('Olá, você está recebendo está mensagem através de um robo desenvolvido com o intuito de encontrar recrutadores de TI, na intenção de de mostrar um pouco do que venho aprendendo durante meu curso de programação que faço pelo @DevPlay Brasil, e mostrar um pouco mais do que faço no meu GitHub - https://github.com/RafaelPSilveira . Obrigado pela sua atenção e até uma próxima oportunidade. ');
            
            const makeConnection = await page.$('[aria-label="Enviar agora"]');
            
            await makeConnection.click('[aria-label="Enviar agora"]');
            
            await page.waitForTimeout(5000);
        }

        navPage++

        if (navPage <=2){
            await paginations(page, navPage)
        }

}

async function login(page){
    await page.waitForSelector('input[id="session_key"]');  
    await page.waitForSelector('input[id="session_password"]');
    await page.waitForSelector('.sign-in-form__submit-button');

    const inputEmail = await page.$('input[id="session_key"]');
    const inputPassword = await page.$('input[id="session_password"]');
    
    if(!inputEmail){
        console.log('E-mail not found');
    }

    if(!inputPassword){
        console.log('Password not found');
    }

    await page.focus('input[id="session_key"]');
    await page.keyboard.type(credentials.user);

    await page.focus('input[id="session_password"]');
    await page.keyboard.type(credentials.pass);

    await page.click('.sign-in-form__submit-button');

    await page.keyboard.press('Enter');
}




   