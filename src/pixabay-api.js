import axios from "axios";

export class PixabayAPI {
    #BASE_URL = 'https://pixabay.com/api/';
    #API_KEY = '38851235-fece57cae64207e00960770f9';

    page = 1;
    per_page = 40;
    query = null;

    async fetchPhotos() {
        const searchParams = new URLSearchParams({
            key: this.#API_KEY,
            q: this.query,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: true,
            page: this.page,
            per_page: this.per_page,
        })

        const dataPhotos = await axios.get(`${this.#BASE_URL}?${searchParams}`)
            .then(response => {
                if (response.status !== 200) {
                    throw new Error(response.status);
                }
                return response.data;
            })
            .catch(error => {
                return error;
            });
            return dataPhotos;
    }
    changePage() {
        this.page += 1;
    }

    resetPage() {
        this.page = 1;
    }
}