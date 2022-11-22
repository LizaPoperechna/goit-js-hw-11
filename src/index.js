import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { throttle } from 'throttle-debounce';


const form = document.querySelector('#search-form');
const input = document.querySelector('.search-form__input');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.search-form__load-more-btn');

const cardHeight = 320;
let pageHeight = document.body.getBoundingClientRect().height;
let viewHeight = visualViewport.height;

let lastSearch = "";
let lastResultCount = 0;
let currentPage = 1;


const lightbox = new SimpleLightbox('.photo-card a', {
    captionsData: "alt",
    captionDelay: 250,
});

loadMoreBtn.style.display = 'none';


async function getData(inputValue, pageNumber = 1) {
    await axios.get('https://pixabay.com/api/', {
        params: {
            key: '31496165-871731723b56e172d6ed684e7',
            q: inputValue,
            image_type: "photo",
            orientation: "horizontal",
            safesearch: true,
            per_page: 40,
            page: pageNumber
        }
})
        .then(response => response.data)
        .then(response => {
            lastResultCount = response.totalHits;
            console.log('lastResultCount');
            if (response.hits.length === 0) {
                    Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
                } else {
                    if (currentPage === 1) {
                        Notiflix.Notify.success(`Hooray! We found ${response.totalHits} images.`);
                } else {
                        Notiflix.Notify.success(`We loaded more images.`);
                    } 
                    gallery.insertAdjacentHTML("beforeend", renderImageList(response.hits));
                    lightbox.refresh();
                    pageHeight = document.body.getBoundingClientRect().height;
            }
            
        })
        .catch(error => {
            console.log(error)
        });
}



function renderImageList(images) {
    return images.map(
            ({
                webformatURL,
                largeImageURL,
                tags,
                likes,
                views,
                comments,
                downloads,
            }) => `<div class="photo-card">
                        <a href = ${largeImageURL}>
                            <img class="photo-card__img" src=${webformatURL} alt=${tags} loading="lazy" />
                            </a>
                                <div class="photo-card__item">
                                    <p class="photo-card__info">
                                        <b>Likes</b>
                                        ${likes}
                                    </p>
                                    <p class="photo-card__info">
                                        <b>Views</b>
                                        ${views}
                                    </p>
                                    <p class="photo-card__info">
                                        <b>Comments</b>
                                        ${comments}
                                    </p>
                                    <p class="photo-card__info">
                                        <b>Downloads</b>
                                        ${downloads}
                                    </p>
                                </div>
                            </div>`
        )
        .join('');

}


form.addEventListener('submit', onSubmit);

function onSubmit(event) {
    event.preventDefault();
    gallery.innerHTML = "";
    currentPage = 1;
    lastSearch = input.value.trim();
    if (lastSearch) {
        getData(lastSearch)
    }
}



document.addEventListener('scroll', throttle(
	500, (e) => {
		if ((window.scrollY + viewHeight + cardHeight * 2) >= pageHeight) {
			if ((currentPage * 40) < lastResultCount) {
				currentPage += 1;
				getData(lastSearch, currentPage);
            } else  {
                Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
                }
		}
}));
    
addEventListener("resize", (event) => {
	viewHeight = visualViewport.height;
});

