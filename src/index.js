import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { PixabayAPI } from './pixabay-api';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

let lightbox = new SimpleLightbox('.gallery a', {
    captionDelay: 250,
});

const pixabayApiInstance = new PixabayAPI();

const searchFormElement = document.querySelector('.search-form');
const galleryContainer = document.querySelector('.gallery');
const inputElement = searchFormElement.firstElementChild;
const loadMoreButton = document.querySelector('.load-more');

loadMoreButton.style.display = 'none';

searchFormElement.addEventListener('submit', handleSearchPhotos);
loadMoreButton.addEventListener('click', handleLoadMorePhotos);
galleryContainer.addEventListener('click', handleCheckClickForImg);

async function handleSearchPhotos(event) {

    event.preventDefault();
    const searchQuery = inputElement.value.trim();

    if (!searchQuery) {
        return;
    }

    try {
        galleryContainer.innerHTML = '';
        pixabayApiInstance.resetPage();
        pixabayApiInstance.query = searchQuery;

        const data = await pixabayApiInstance.fetchPhotos();
        
        if (!data.totalHits) {
            loadMoreButton.style.display = 'none';
            Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        } else {
            Notify.success(`Hooray! We found ${data.totalHits} images. `);
        }
        if (data.totalHits > pixabayApiInstance.per_page) {
            loadMoreButton.style.display = 'block';
        } 
        pixabayApiInstance.changePage();

        const markup = markupPhotos(data.hits);
        renderMarkup(markup);
    } catch (error) {
        console.warn(error);
    }
}

function markupPhotos(photosMarkup) {
    return photosMarkup.map(({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
    }) => `
    <div class="photo-card">
    <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy"/></a>
    <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${downloads}
    </p>
    </div>
    </div>
    `).join('');
}

async function handleLoadMorePhotos() {
    try {
        const data = await pixabayApiInstance.fetchPhotos();
        pixabayApiInstance.changePage();
        if (data.hits.length < pixabayApiInstance.per_page) {
            loadMoreButton.style.display = 'none';
            Notify.failure("We're sorry, but you've reached the end of search results.");
            return;
        }
        const markup = markupPhotos(data.hits);
        renderMarkup(markup);
        scrollToUp();
    } catch (error) {
        console.warn(error);
    }
}

// function handleLoadMorePhotos() {
//     pixabayApiInstance.fetchPhotos()
//         .then((data) => {
//             pixabayApiInstance.changePage();
//             if (data.hits.length < pixabayApiInstance.per_page) {
//                 loadMoreButton.style.display = 'none';
//                 return Notify.failure("We're sorry, but you've reached the end of search results.");
//             }
//             return markupPhotos(data.hits);
//         })
//         .then(markup => renderMarkup(markup))
//         .then(scrollToUp)
//         .catch(console.warn);
// }

function renderMarkup(markup) {
    galleryContainer.innerHTML = markup;
    // galleryContainer.insertAdjacentHTML('beforeend', markup);
    lightbox.refresh();
}

function handleCheckClickForImg(event) {
    event.preventDefault();
    if (event.target.nodeName !== 'IMG') {
        return;
    }
}

function scrollToUp() {
    const { height: cardHeight } = document
  .querySelector(".gallery")
  .firstElementChild.getBoundingClientRect();

window.scrollBy({
  top: cardHeight * 2,
  behavior: "smooth",
});
}
