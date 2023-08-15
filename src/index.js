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

function handleSearchPhotos(event) {

    event.preventDefault();
    const searchQuery = inputElement.value.trim();

    if (!searchQuery) {
        return;
    }

    pixabayApiInstance.resetPage();
    pixabayApiInstance.query = searchQuery;
    pixabayApiInstance.fetchPhotos().then(data => {
        // console.log(data);
        if (!data.totalHits) {
            loadMoreButton.style.display = 'none';
            return Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        } else if (data.totalHits > pixabayApiInstance.per_page) {
            loadMoreButton.style.display = 'block';
            Notify.success(`Hooray! We found ${data.totalHits} images. `);
        }
        pixabayApiInstance.changePage();
        return markupPhotos(data.hits);
    })
        .then(markup => renderMarkup(markup))
        .catch(console.warn);
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

function handleLoadMorePhotos() {
    pixabayApiInstance.fetchPhotos()
        .then((data) => {
            pixabayApiInstance.changePage();
            if (data.hits.length < pixabayApiInstance.per_page) {
                loadMoreButton.style.display = 'none';
                return Notify.failure("We're sorry, but you've reached the end of search results.");
            }
            return markupPhotos(data.hits);
        })
        .then(markup => renderMarkup(markup))
        .then(scrollToUp)
        .catch(console.warn);
}

function renderMarkup(markup) {
    galleryContainer.insertAdjacentHTML('beforeend', markup);
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
