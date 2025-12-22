import { createApp } from 'vue'
import './styles/global.css'
import App from './App.vue'

const app = createApp(App)

app.config.errorHandler = (err,instance,info) => {
    console.error('Erreur capturé par Vue : ');
    console.error(err)

    console.error('Composant fautif',instance)

    console.log('Moment de l\'erreur',info)

    
}

app.mount('#app')
