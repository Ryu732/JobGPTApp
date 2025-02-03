<template>
	<v-main>
		<v-container>
			<v-row justify="center">
				<div class="home_title">
					<h1>就活支援アプリへようこそ</h1>
					<p>このサイトでは、以下の機能が使えます</p>
				</div>
			</v-row>
			<v-row>
				<v-col>
					<v-card @click="router.push('/com_question')" class="functionList">
						<v-card-title>
							<h3>会社質問</h3>
						</v-card-title>
						<v-card-text>
							<p>会社情報の検索をAIがサポートしてくれます</p>
							<p> AIに質問してみよう!</p>
							<p>例: 〇〇社の主な事業を教えて</p>
						</v-card-text>
					</v-card>
				</v-col>
				<v-col>
					<v-card @click="router.push('/es')" class="functionList">
						<v-card-title>
							<h3>エントリーシート作成(ログイン時のみ)</h3>
						</v-card-title>
						<v-card-text>
							<p>ESの作成をAIがサポートしてくれます</p>
							<p>AIと会話するだけで、ESが作成できちゃう</p>
							<p>ガクチカや自分の強みなどを、作ろう！</p>
						</v-card-text>
					</v-card>
				</v-col>
				<v-col>
					<v-card class="functionList">
						<v-card-title>
							<h3>メモ(未完成)</h3>
						</v-card-title>
						<v-card-text>
							<p>就活イベントのメモを作ろう!</p>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
		</v-container>
	</v-main>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter();


</script>

<style scoped>
.v-main {
	background-color: #f8f9fa;
}

.home_title {
	text-align: center;
	margin-bottom: 5vh;
}

.functionList {
	height: 30vh;
	text-align: center;
}

.v-card-text {
	margin-top: 3vh;
	line-height: 2em;
}
</style>