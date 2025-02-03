import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/authstore';
import Home from './views/AppHome.vue'
import ChatComQuestionApp from './views/ChatComQuestionApp.vue'
import ES_create from './views/ES_create.vue'

const routes = [
	{
		path: '/',
		name: 'home',
		component: Home
	},
	{
		path: '/com_question',
		name: 'com_question',
		component: ChatComQuestionApp
	},
	{
		path: '/es',
		name: 'es',
		component: ES_create,
		meta: { requiresAuth: true } // ログインが必要なページ
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

router.beforeEach(async (to, from, next) => {
	const authStore = useAuthStore()

	if (to.meta.requiresAuth && !authStore.isAuth) { // ログインが必要なページにアクセスしようとしたが、ログインしていない場合
		alert('ログインが必要です');
		next({ name: 'home' })
	} else {
		next()
	}
})
export default router;