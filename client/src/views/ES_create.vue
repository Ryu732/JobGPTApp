<template>
	<v-main>
		<v-container fluid fill-height class="main-content">
			<v-row class="fill-height">
				<v-col cols="12" md="2" class="modeChoice">
					<div class="fill-height">
						<div class="esSettings">
							<p> エントリーシートの内容 *</p>
							<v-select :items="esMode" v-model="esModeSelect" :disabled="isModeLock"></v-select>
						</div>
						<div class="esSettings">
							<p>文字数上限 *</p>
							<v-text-field v-model="esLength" type="number" :disabled="isModeLock"></v-text-field>
						</div>
						<div class="esSettings">
							<p>会社名</p>
							<v-text-field persistent-placeholder placeholder="〇〇株式会社 なくてもOK" v-model="esCompany"
								:disabled="isModeLock"></v-text-field>
						</div>
						<div class="esSettings">
							<p>会社からの質問内容</p>
							<v-text-field persistent-placeholder placeholder="コピペしてね！ なくてもOK" v-model="esQuestion"
								:disabled="isModeLock"></v-text-field>
						</div>
						<v-btn @click="sendSettings" :disabled="isModeLock">ESの設定をAIに読み込む</v-btn>
						<v-btn @click="isDeleteDialog = true" :disabled="!isModeLock">ES作成履歴を削除</v-btn>
					</div>
					<v-btn @click="isESHistoryDialog = true" class="historyBtn">過去の履歴</v-btn>
				</v-col>
				<v-col cols="12" md="10" class="fill-height">
					<div class="chat-container">
						<div class="chat-out">
							<div v-for="message in messages" :key="message.id" class="chat-message"
								:class="{ 'user_hilight': message.sender === 'human' }">
								<div>
									<v-icon v-if="message.sender === 'AI'">mdi-robot</v-icon>
									<v-icon v-else>mdi-account-circle</v-icon>
									<p v-html="message.chatText"></p>
								</div>
								<v-btn @click="saveES(message.id)" v-if="message.sender === 'AI' && message.id >= 4">
									<v-icon>mdi-archive</v-icon>
								</v-btn>
							</div>
						</div>
						<v-form @submit.prevent="sendAI" class="input-form">
							<v-textarea v-model="inputText" :disabled="isSubmit || !isModeLock" clearable auto-grow
								rows="1" class="text-input"></v-textarea>
							<v-btn @click="sendAI" :loading="isSubmit || !isModeLock" rounded="lg"
								class="send-btn">送信</v-btn>
						</v-form>
					</div>
				</v-col>
			</v-row>
			<v-dialog v-model="isDeleteDialog" max-width="400">
				<v-card>
					<v-card-text>
						本当に会話履歴を削除しますか？<br>
						（これまでの会話内容は全て削除されます）
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn color="primary" text @click="deleteESHistory">
							実行する
						</v-btn>
						<v-btn color="grey darken-1" text @click="isDeleteDialog = false">
							キャンセル
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
			<v-dialog v-model="isESHistoryDialog">
				<HistoryES />
			</v-dialog>
		</v-container>
	</v-main>
</template>

<script setup>
import HistoryES from '@/components/HistoryES.vue';
import { ref, nextTick, onMounted } from 'vue';
import axios from 'axios';

const esMode = ref([
	'学生時代頑張ったこと',
	'自己PR',
	'長所、短所について',
]);
const esModeSelect = ref(null);//選択中のESモード
const esLength = ref(null);// ESの文字数
const esCompany = ref(null);// 会社名
const esQuestion = ref(null);// ESで聞かれている質問

const isModeLock = ref(false);// ESモードの選択をロックするかどうか
const isDeleteDialog = ref(false);// 削除ダイアログの表示
const isESHistoryDialog = ref(false);// ES履歴ダイアログの表示

const inputText = ref('');// ユーザーから入力される会社名

const firstMessageNum = 1;// チャットに最初からあるメッセージの数
const messages = ref([// チャット画面に表示させる情報
	{
		id: 1,
		chatText: 'こんにちは<br>一緒にエントリーシートを考えましょう<br>左側の欄を入力して、送信ボタンを押してください',// チャットの内容
		sender: 'AI',// 送信者
	},
]);

// 入力した会社名を送るエンドポイント
const baseURL = process.env.VUE_APP_SERVER_BASEURL;
const ESCreateURL = `${baseURL}/escreate`;

const isSubmit = ref(false);// バックエンドに送信中かどうか

onMounted(async () => {
	// サーバーのエントリーシート作成履歴を取得
	await axios.get(`${ESCreateURL}`)
		.then(async response => {
			// ES作成履歴がない場合は、何もしない
			if (response.data.esSettings === null) {
				return;
			} else if (response.data.esSettings.esMode !== null) {
				isModeLock.value = true;// ESモードの選択をロックする
			}

			// ES作成履歴を反映
			esModeSelect.value = response.data.esSettings.esMode;
			esLength.value = response.data.esSettings.esLength;
			esCompany.value = response.data.esSettings.esCompany;
			esQuestion.value = response.data.esSettings.esQuestion;

			// チャット欄に返信内容を追加
			response.data.esChat.forEach((chat) => {
				messages.value.push({
					id: messages.value.length + 1,
					chatText: chat.chatText,
					sender: chat.sender,
				});
			});
		})
		.catch(error => {
			alert('ESの設定を左側からしてください', error);
		});

	await nextTick();// DOMの更新待ち
	scrollToBottom();// チャットのスクロールを一番下まで移動
});

//サーバーにES設定を送信
async function sendSettings() {
	// 入力内容が空かどうかチェック
	if (esModeSelect.value == null) {
		alert('左側で、どんなエントリーシートを書くか選択してください');
		return;
	} else if (esLength.value == null) {
		alert('文字数を入力してください');
		return;
	}

	isModeLock.value = true;// ESモードの選択をロックする

	const esSettings = {//考えたいESの設定
		esMode: esModeSelect.value,
		esLength: esLength.value,
		esCompany: esCompany.value,
		esQuestion: esQuestion.value,
	};

	await axios.post(`${ESCreateURL}/setting`, esSettings)
		.then(async response => {
			// チャット欄に返信内容を追加
			messages.value.push({
				id: messages.value.length + 1,
				chatText: response.data.chatText,
				sender: 'AI',
			});
		})
		.catch(error => {
			alert('データの取得に失敗しました。再度ESの設定を送信してください', error);
		});
}

// サーバーに、AIとの会話文を送受信
async function sendAI() {
	if (inputText.value.trim() === '') {
		alert('テキストが入力されていません');
		return;
	}

	isSubmit.value = true;// フォーム送信中をオンにする

	// axiosを利用して、バックエンドへのデータの送受信
	await axios.post(`${ESCreateURL}`, { UserChatText: inputText.value })
		.then(async response => {
			// ユーザーのメッセージを追加
			messages.value.push({
				id: messages.value.length + 1,
				chatText: inputText.value,
				sender: 'human'
			});

			// チャット欄に返信内容を追加
			messages.value.push({
				id: messages.value.length + 1,
				chatText: response.data.chatText,
				sender: 'AI',
			});
			await nextTick();// DOMの更新待ち
			scrollToBottom();// チャットのスクロールを一番下まで移動
			inputText.value = '';// 入力データの削除
		})
		.catch(error => {
			alert('データの取得に失敗しました。再度同じ文章を入力してください。', error);
		});

	isSubmit.value = false;// フォーム送信中をオンにする
}

// サーバーにES作成履歴を削除するリクエストを送信
async function deleteESHistory() {
	await axios.delete(`${ESCreateURL}`)
		.then(response => {
			// ページをリロード
			window.location.reload();
			alert(response.data);
		})
		.catch(error => {
			alert('エラーが発生しました', error);
		});
}

// サーバーにES保存のリクエストを送信
async function saveES(newESId) {
	// ESの本文を取得
	const newES = messages.value[newESId - firstMessageNum].chatText;

	await axios.post(`${ESCreateURL}/saveES`, { ESCompany: esCompany.value, ESMode: esModeSelect.value, newES: newES })
		.then(response => {
			// ページをリロード
			window.location.reload();
			alert(response.data);
		})
		.catch(error => {
			alert('エラーが発生しました、もう一度保存ボタンを押してください', error);
		});
}

// 一番下まで、チャット画面をスクロールする
function scrollToBottom() {
	const chatContainer = document.querySelector('.chat-out');
	chatContainer.scrollTop = chatContainer.scrollHeight;
}


</script>

<style scoped>
.chat-container {
	max-width: 100%;
	display: flex;
	flex-direction: column;
	height: 100%;
}


.chat-out {
	background-color: #e0e0e0;
	display: flex;
	flex: 1;
	flex-direction: column;
	overflow-y: auto;
	padding: 1em;
	margin-bottom: 0.5em;
	border-radius: 0.5em;
}

.chat-message {
	background-color: rgb(197, 196, 196);
	padding: 1em;
	padding-left: 2em;
	padding-right: 2em;
	margin-bottom: 1.5em;
	border-radius: 1.2em;
	display: block;
	max-width: 70%;
	white-space: pre-wrap;
	word-wrap: break-word;
	line-height: 1.75em;
	align-self: flex-start;
}

.user_hilight {
	background-color: #d3eef7;
	align-self: flex-end;
	text-align: right;
}

.input-form {
	display: flex;
}

.v-main {
	height: calc(100vh - 4em);
	padding: 0;
	margin-top: 4em;
	background-color: #f8f9fa;
}

.main-content {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.fill-height {
	height: 100%;
}

.text-input {
	flex: 1;
	max-height: 40vh;
	overflow-y: auto;
}

.send-btn {
	height: calc(100% - 2.5vh);
}

.modeChoice {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.historyBtn {
	margin-bottom: 1.5em;
	width: 100%;
	align-self: flex-end;
}

.esSettings {
	margin: 1em 0;
}
</style>