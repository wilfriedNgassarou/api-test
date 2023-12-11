const apiKey = "d2XO8S4QizRpIYbXMZjvuzosG3OtB06p" ;
const form = document.forms[0] ;
const input = form.elements[0];

const sliderNav = document.querySelector('.slider-nav') ;
const panorama = document.querySelector('.panorama') ;
const onloadButton = document.querySelector('.btn-onload');
const resultLoader = document.querySelector('.loader');
const errorContainer = document.querySelector('.error') ;
const navigationButton = document.querySelector('.navigation-btn') ;

let index = 0 ;
let currentActive = null ;

// Gestionnaire d'évènement sur le bouton suivant et précédant
navigationButton.addEventListener('click', function(e){
  if(!e.target.dataset.action) return 

  let action = e.target.dataset.action ;

  if(action == "next") {

    // Si on appuie sur suivant en étant sur le dernier élément, il ne se passe rien
    if(index == sliderNav.children.length - 1) {
      return 
    }

    ++index;

    currentActive?.classList?.remove('active');

    sliderNav.children[index].classList.add('active');
    currentActive = sliderNav.children[index];

    panorama.style.transform = `translateX(-${index * 375}px)`
    
    return 
  }

  // Si on appuie sur précédant en étant sur le premier élément, il ne se passe rien
  if(index == 0) {
    return ;
  }
  
  --index ;
  
  currentActive?.classList?.remove('active');

  sliderNav.children[index].classList.add('active');
  currentActive = sliderNav.children[index];

  panorama.style.transform = `translateX(-${index * 375}px)`
})

// Gestionnaire d'évènement sur les éléments Li du slider navBar
sliderNav.addEventListener('click', function(e){
  if(e.target.tagName != "LI") return ;

  currentActive?.classList?.remove('active') ;

  let li = e.target ;
  index = e.target.dataset.index ;
  
  currentActive = li ;
  li.classList.add('active');

  panorama.style.transform = `translateX(-${index * 375}px)`
})

form.addEventListener('submit', async function(e){
  e.preventDefault();
  
  // A chaque recherche, on réinitialise les éléments 
  resetLoader(onloadButton, panorama, sliderNav, errorContainer, navigationButton) ;
  
  let datas = await getData(input.value) ;
  datas = datas?.response?.docs ;

  onloadButton.classList.remove('onload') ;

  if(!datas) {
    errorContainer.style.display = "block" ;
    resultLoader.style.display = "none" ;
    
    return 
  }

  resultLoader.style.display = "block" ;

  // Insérer les éléments dans le DOM
  insertCards(datas, resultLoader, navigationButton, panorama, sliderNav, form)

})

/**
 * 
 * @param {Array} cards 
 * @param {HTMLElement} resultLoader 
 * @param {HTMLElement} navigationButton 
 * @param {HTMLElement} panorama 
 * @param {HTMLElement} sliderNav 
 * @param {HTMLElement} form 
 */
function insertCards(cards, resultLoader, navigationButton, panorama, sliderNav, form) {
  for(let i = 0; i < cards.length; i++) {
    let item = createCard(cards[i]);
    let listItem = createNavItem(i)

    if(i == 1) {
      item.querySelector('img').onload = () => {
        // Masque le loader et affiche les boutons de navigation
        resultLoader.style.display = "none" ;
        navigationButton.style.display = "flex" ;

        form.reset() ;
      }
      item.querySelector('img').onerror = () => {
        // Masque le loader et affiche les boutons de navigation
        resultLoader.style.display = "none" ;
        navigationButton.style.display = "flex" ;

        form.reset() ;
      }
    }

    panorama.append(item)
    sliderNav.append(listItem)
  }

}


/**
 * 
 * @param {Array} datas 
 */
function createCard(data) {
  
    const { container, imgContainer, img, h2, paragraph, link } = createCardElement() ;

    container.classList.add('item');
    imgContainer.classList.add('img-container')

    img.src =  `https://www.nytimes.com/${data.multimedia[0]?.url}` ; 
    
    h2.textContent = data.headline.main ;
    // paragraph.textContent = data.abstract ;
    paragraph.textContent = showText(data.abstract) ;
    
    link.href = data.web_url ;
    link.textContent = `View article on NYT`;
    link.target = "_blank"
    
    imgContainer.append(img)
    container.append(imgContainer, h2, paragraph, link) ;

    return container ;

}

/**
 * Retourne un élément de liste li pour le slider
 * @param {Number} index 
 * @returns 
 */
function createNavItem(index) {
  let li = document.createElement('li') ;

  if(index == 0) {
    li.classList.add('active')
    currentActive = li 
  }

  li.dataset.index = +index ;

  return li
}

/**
 * 
 * @param {String} search 
 */
async function getData(search) {
  let response,datas ;

  try {
    response = await fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${encodeURIComponent(search)}&api-key=${apiKey}`)
    datas = await response.json();
  } catch(e) {
    datas = false ;
  }

  return datas ;
}

/**
 * Crée les éléments nécessaires à l'affichage d'une carte dans la page web
 */
function createCardElement () {

  return {
    container: document.createElement('div'),
    imgContainer: document.createElement('div'),
    img: document.createElement('img'),
    h2: document.createElement('h2'),
    paragraph: document.createElement('p'), 
    link: document.createElement('a'),
  }
}

/**
 * Permet d'initialiser le chargment et l'attente de reponse
 * @param {HTMLElement} onloadButton 
 * @param {HTMLElement} panorama 
 * @param {HTMLElement} sliderNav 
 * @param {HTMLElement} errorContainer 
 */
function resetLoader(onloadButton, panorama, sliderNav, errorContainer, navigationButton){
 
  index = 0 ;

  onloadButton.classList.add('onload');
  
  panorama.innerHTML = "" ;
  errorContainer.style.display = "" ;
  sliderNav.innerHTML = "" ;
  
  navigationButton.style.display = "none";
  
  panorama.style.transform = `translateX(0px)`
}


/**
 * Limite le nombre de caractere a afficher
 * @param {String} text 
 */
function showText(text) {
  if(text.length > 150) {
    return text.substring(0, 150) + '...' ;
  }

  return text ;
}
