<template>
      <router-view />
  </template>
  
  <script></script>

  
/*import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

//import { jwtDecode } from 'jwt-decode';

export default {
    setup() {
        const user = ref(null);
        const router = useRouter();
        console.log(router)
        onMounted(() => {
           /* const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            console.log("Token from URL:", token);

            if (token) {
            localStorage.setItem('token', token);
            }

            if (!token) {
                // Redirect hvis det ikke finnes en token
                console.log("ingen token registrert")
                router.push('/');
                return;
            }*/

           /* try {
                // Dekode JWT-token for å hente brukerdata
               // const decoded = jwtDecode(token);
                //console.log("decoded token:", decoded);

                // Her kan du bruke `decoded` for å bestemme brukeren og tilgangsnivå
                user.value = {
                    id: '01',
                    role: 'Hovedadmin',
                    companyId: '01'
                };

                console.log('user:', user.value);

                // Eksempel: redirect basert på rolle eller annen logikk
                if (user.value.role === 'Admin' || user.value.role === 'Hovedadmin') {
                    console.log("Navigating to Test")
                    router.push('/test');
                }
            } catch (error) {
                console.log("Error decoding token:", error);
                // Redirect ved feil
                router.push('/test');
            }
        });

        return { user };
    }
};*/
