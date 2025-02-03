<!-- ESの履歴表示コンポーネント-->
<!-- ESの履歴をダイアログで表示する -->
<template>
	<v-row>
		<v-col v-for="message in ESLists" :key="message.id" cols="6" class="chat-message">
			<v-card>
				<v-card-title>{{ message.ESMode }}</v-card-title>
				<v-card-subtitle>{{ message.ESCompany }}</v-card-subtitle>
				<v-card-text>
					<p>{{ message.EStext }}</p>
				</v-card-text>
			</v-card>
		</v-col>
	</v-row>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authstore';
import axios from 'axios';

const authStore = useAuthStore();
const islogin = computed(() => authStore.isAuth);//ログインしているかどうか

const ESLists = ref([// ESの履歴画面に表示するデータ
	{
		id: 1,
		ESMode: '自己PR',
		ESCompany: '~~株式会社',
		EStext: '',
	}
]);


// ES履歴を取得するエンドポイント
const baseURL = process.env.VUE_APP_SERVER_BASEURL;
const backendEndESHistory = `${baseURL}/escreate/EShistory`;

// マウント時にES履歴を取得する
onMounted(() => {
	getESHistroy();
});

// ES履歴を取得する
async function getESHistroy() {
	if (islogin.value) { // ログインしているかどうか？
		await axios.get(backendEndESHistory)
			.then(async response => {
				for (const doc of response.data) {
					//チャット欄にDBの内容を追加
					ESLists.value.push({
						id: ESLists.value.length + 1,
						ESMode: doc.ESMode,
						ESCompany: doc.ESCompany,
						EStext: doc.EStext,
					});
				}
			})
			.catch(error => {
				console.log('DBのデータ取得失敗', error);
			});
	}
}

</script>

<style scoped></style>