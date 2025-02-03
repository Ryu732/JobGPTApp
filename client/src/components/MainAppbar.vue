<!-- アプリバーのコンポーネント-->
<!-- 機能 -->
<!-- ナビゲーションバー 現在使用中の機能の表示(文字列) ログイン&サインイン ホームに戻る (左から順に) -->
<template>
	<v-app-bar color="primary">
		<template v-slot:append>
			<v-btn @click="singupDialog = true" v-if="!islogin" class="account-btn">
				<v-icon left large>mdi-account-plus</v-icon>
				アカウント作成
			</v-btn>
			<v-btn @click="loginDialog = true" v-if="!islogin" class="account-btn">
				<v-icon left large>mdi-login</v-icon>
				ログイン
			</v-btn>
			<div v-if="islogin">
				{{ username }}さん
			</div>
			<v-btn @click="logoutDialog = true" v-if="islogin" class="account-btn">
				<v-icon left large>mdi-logout</v-icon>
				ログアウト
			</v-btn>

			<v-btn :to="{ name: 'home' }">
				<v-icon left>
					mdi-home
				</v-icon>
			</v-btn>
		</template>

		<v-app-bar-title>
			{{ pageTitle }}
		</v-app-bar-title>

		<template v-slot:prepend>
			<v-app-bar-nav-icon @click.stop="navi = !navi"></v-app-bar-nav-icon>
		</template>

	</v-app-bar>
	<v-navigation-drawer v-model="navi">
		<v-list>
			<v-list-item title="Homeに戻る" @click="router.push('/'); navi = false"></v-list-item>
			<v-list-item title="会社検索" @click="router.push('/com_question'); navi = false"></v-list-item>
			<v-list-item title="ES作成(ログイン時のみ)" @click="router.push('/es'); navi = false"></v-list-item>
		</v-list>
	</v-navigation-drawer>

	<!-- ログインダイアログ-->
	<v-dialog v-model="loginDialog" persistent max-width="30em">
		<v-card>
			<v-card-title>
				<span class="headline">ログイン</span>
			</v-card-title>
			<v-card-text>
				<v-form @submit.prevent="login">
					<v-text-field v-model="loginID" label="ID" :disabled="isSubmit" class="text-input"
						clearable></v-text-field>
					<v-text-field v-model="loginPass" label="PassWord" :disabled="isSubmit" class="text-input" clearable
						:append-inner-icon="hidePassword ? 'mdi-eye' : 'mdi-eye-off'"
						:type="hidePassword ? 'password' : 'text'"
						@click:append-inner="hidePassword = !hidePassword"></v-text-field>
					<v-btn type="submit" :loading="isSubmit" rounded="lg">送信</v-btn>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer>
					<div class="errorMsg"> {{ errorMessage }} </div>
				</v-spacer>
				<v-btn @click="loginDialog = false; clearLoginData()" :disabled="isSubmit" color="primary">閉じる</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>

	<!-- アカウント作成ダイアログ-->
	<v-dialog v-model="singupDialog" persistent max-width="30em">
		<v-card class="signup-sheet">
			<v-card-title>
				<span class="headline">アカウント作成</span>
			</v-card-title>
			<v-card-text>
				<v-form @submit.prevent="singup">
					<v-text-field v-model="loginID" label="ID" :disabled="isSubmit" class="text-input"
						clearable></v-text-field>
					<v-text-field v-model="loginPass" label="PassWord" :disabled="isSubmit" class="text-input" clearable
						:append-inner-icon="hidePassword ? 'mdi-eye' : 'mdi-eye-off'"
						:type="hidePassword ? 'password' : 'text'"
						@click:append-inner="hidePassword = !hidePassword"></v-text-field>
					<v-btn type="submit" :loading="isSubmit" rounded="lg" class="signup-sheet">送信</v-btn>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer>
					<div class="errorMsg"> {{ errorMessage }} </div>
				</v-spacer>
				<v-btn @click="singupDialog = false; clearLoginData()" :disabled="isSubmit" color="primary">閉じる</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<!-- ログアウトダイアログ-->
	<v-dialog v-model="logoutDialog" persistent max-width="400">
		<v-card class="signup-sheet">
			<v-card-title>
				<span class="headline">ログアウト</span>
			</v-card-title>
			<v-card-text>
				<p>{{ username }} さん</p>
				<p>本当にログアウトしてもよろしいですか？</p>
			</v-card-text>
			<v-card-actions style="justify-content: space-between;">
				<v-spacer></v-spacer>
				<v-btn @click="logoutDialog = false; logout()"
					style="background-color: red; color: white;">ログアウト</v-btn>
				<v-btn @click="logoutDialog = false" color="primary">閉じる</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/authstore';
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const pageTitle = ref();//現在使用中の機能の表示
watch(route, (newRoute) => {//ルートの変更時にページタイトルを変更
	switch (newRoute.name) {
		case 'home':
			pageTitle.value = 'ホーム';
			break;
		case 'com_question':
			pageTitle.value = '会社検索';
			break;
		case 'es':
			pageTitle.value = 'ES作成';
			break;
		default:
			pageTitle.value = '就活アプリ';
			break;
	}
}, { immediate: true });

const islogin = computed(() => authStore.isAuth);//ログインしているかどうか
const username = computed(() => authStore.userId);//ログイン中のユーザー名

const loginDialog = ref(false);//ログインダイアログの送信中
const singupDialog = ref(false);//サインアップダイアログの送信中
const logoutDialog = ref(false);//サインアップダイアログの送信中
const navi = ref(false);//ナビゲーションバーの表示
const loginID = ref('');
const loginPass = ref('');

const hidePassword = ref(true);//パスワードの非表示
const errorMessage = ref('');//ログイン不可の理由
const isSubmit = ref(false);//フォームを送信中

// ログイン情報を送るエンドポイント
const baseURL = process.env.VUE_APP_SERVER_BASEURL;
const backendEndUsers = `${baseURL}/users`;

//入力していたログイン情報などを消去
function clearLoginData() {
	loginID.value = '';
	loginPass.value = '';
	errorMessage.value = '';
}

//ログイン情報をバックエンドに送る
async function login() {
	isSubmit.value = true;

	await axios.post(`${backendEndUsers}/login`, { id: loginID.value, password: loginPass.value })
		.then(response => {
			if (response.data.success) {//ログイン成功時
				alert(response.data.message);//画面出力
				authStore.login(response.data.userId);//ストアに保存
				loginDialog.value = false; // ログインダイアログを閉じる
				clearLoginData(); // フォームデータをクリア
			} else {//ログイン失敗時
				errorMessage.value = response.data.message;
			}

		})
		.catch(error => {
			errorMessage.value = error;//データ取得やバックエンド接続失敗時
			console.log('ログインデータ取得失敗', error);
		});

	isSubmit.value = false;
}

//アカウント登録情報をバックエンドに送る
async function singup() {
	isSubmit.value = true;

	await axios.post(`${backendEndUsers}/signup`, { id: loginID.value, password: loginPass.value })
		.then(response => {
			if (response.data.success) {//アカウント作成成功時
				alert(response.data.message);//画面出力
				authStore.login(response.data.userId);//ストアに保存
				loginDialog.value = false; // ログインダイアログを閉じる
				clearLoginData(); // フォームデータをクリア
			} else {//アカウント作成失敗時
				errorMessage.value = response.data.message;
			}
		})
		.catch(error => {
			errorMessage.value = error;//データ取得やバックエンド接続失敗時
			console.log('アカウントデータ取得失敗', error);
		});

	isSubmit.value = false;
}

//ログアウト処理
async function logout() {

	await axios.get(`${backendEndUsers}/logout`)
		.then(response => {
			alert(response.data.message);
		})
		.catch(error => {
			errorMessage.value = error;//失敗時
			console.log('ログアウト失敗', error);
		});
	await authStore.logout();//ストアのログアウト関数を実行
	window.location.reload();//画面リロード
}
</script>

<style scoped>
.signup-sheet {
	background-color: #f8feff;
}

.text-input {
	margin-bottom: 1em;
}

.errorMsg {
	color: red;
}

.account-btn {
	display: flex;
	align-items: center;
	font-size: 1rem;
}

.account-btn .v-icon {
	margin-right: 0.2em;
}

.logout-card {
	margin: 1.5vh 0;
}
</style>