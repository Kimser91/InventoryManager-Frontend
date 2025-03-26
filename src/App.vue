<script>
import { ref, onMounted } from 'vue';
import { getUser } from './services/authServices';

export default {
    setup() {
        const user = ref(null);

        onMounted(async () => {
            // Sjekk om token er i URL
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');

            if (token) {
                // Lagre token i LocalStorage
                localStorage.setItem('token', token);
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            // Hent brukerinfo med token
            try {
                const response = await getUser();
                user.value = response.data;
            } catch (error) {
                // Hvis token er ugyldig eller mangler, send til login
                window.location.href = 'https://inventoryadministrator.com/login';
            }
        });

        return { user };
    }
};
</script>
