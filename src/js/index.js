import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const axios = require('axios').default;

const form = document.querySelector('.search-form');
const loadMore = document.querySelector('.load-more ');
const gallery = document.querySelector(".gallery");
const target = document.querySelector('.js-guard');

const url = 'https://pixabay.com/api/';
const api_key = '38325777-12f57d8108d1a43c6a779e8ee';

let currentPage = 1;

loadMore.addEventListener('click', onLoad)

//з конпкою
// function onLoad() {
//     currentPage +=1;
    
//     getTrending(currentPage);

// }
function onLoad(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            currentPage +=1;
            getTrending(currentPage);
        }
    })

}

form.addEventListener('submit', formSubmit)

let text = '';

function formSubmit(evt) {
    evt.preventDefault();
    gallery.innerHTML = "";
    observer.unobserve(target);
    currentPage = 1;
    text = form.elements.searchQuery.value;
    getTrending(currentPage);
}

function getTrending(page=1) {
    axios.get(url,{
        params: {
            key: api_key,
            q: text,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: 'true',
            page: page,
            per_page: 40,
        }
    })
    .then((response) => {
        if (response.data.hits === []) {
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            return;
        }
        const spisok = response.data.hits;
        // console.log(response);
        gallery.insertAdjacentHTML('beforeend', showBreedImage(spisok));
        
        lightbox.refresh();
        if (currentPage === 1) {
            Notiflix.Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
        } else {
            const { height: cardHeight } = document
                .querySelector(".gallery")
                .firstElementChild.getBoundingClientRect();

                window.scrollBy({
                top: cardHeight * 2,
                behavior: "smooth",
            });
        }
        if ( page*40 <= response.data.totalHits) {
            // loadMore.hidden = false;
            // loadMore.style.display = 'block';
            observer.observe(target);
        }else {
            observer.unobserve(target);
            // loadMore.hidden = true;
            Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.");
        }

    })
    .catch(function(error) {
        loadMore.hidden = true;
        Notiflix.Notify.failure('Oops! Something went wrong! Try reloading the page!');
    });
}


function showBreedImage(spisok) { 
        return spisok.map((number) => 
            `<div class="photo-card">
                <a href="${number.largeImageURL}" class="gallery__link">
                    <img src="${number.webformatURL}" alt="${number.tags}" loading="lazy" width="249" class="gallery__image">
                </a>
                <div class="info">
                    <p class="info-item">
                        <b>Likes<span>${number.likes}</span></b>
                    </p>
                    <p class="info-item">
                        <b>Views<span>${number.views}</span></b>
                    </p>
                    <p class="info-item">
                        <b>Comments<span>${number.comments}</span></b>
                    </p>
                    <p class="info-item">
                        <b>Downloads<span>${number.downloads}</span></b>
                    </p>
                </div>
            </div>`).join("");
}
 
const lightbox = new SimpleLightbox('.gallery a', {
    caption: true,
    captionsData: 'alt',
    captionDelay: 250,
});

let options = {
    root: null,
    rootMargin: '300px',
    threshold: 1.0
}
let observer = new IntersectionObserver(onLoad, options);