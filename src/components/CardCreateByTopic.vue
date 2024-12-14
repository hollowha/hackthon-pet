<template>
  <div class="card-block">
    <button @click="showScreen" v-if="!show">Add Card</button>
    <div class="word-card" v-if="show">
      <div class="word-card__header">
        <h2 class="word-card__title">建立主題式字卡</h2>
        <button class="word-card__close" @click="closeAddCard">
          <strong>X</strong>
        </button>
      </div>
      <div class="word-card__content" style="justify-content: left">
        <input style="display: flex" type="text" class="word-card__input" placeholder="輸入主題" v-model="inputWord" />
        <button class="word-card__button" :disabled="empty" @click="generateWords">
          生成單字
        </button>
      </div>
    </div>
    <div v-if="currentQuestion" class="word-card__question">
      <h2 class="word-card__question-title">{{ currentQuestion.chineseTranslation }}</h2>
      <div class="word-card__options">
        <button 
          v-for="(option, index) in currentQuestion.options" 
          :key="index" 
          :class="{'correct': isSelectedCorrect && selectedOptionIndex === index}" 
          @click="handleAnswer(option, index)">
          {{ option }}
        </button>
      </div>
    </div>
    <div v-if="showLoading" class="loading-modal">
      <div class="loading-content">
        <p>Loading...</p>
      </div>
    </div>
  </div>
</template>

<script>
import OpenAI from "openai";

export default {
  data() {
    return {
      inputWord: "",
      wordList: [],
      currentQuestion: null,
      show: true,
      showLoading: false,
      selectedOptionIndex: null,
      isSelectedCorrect: false,
    };
  },
  computed: {
    empty() {
      return !this.inputWord;
    },
  },
  methods: {
    showScreen() {
      this.show = !this.show;
    },
    closeAddCard() {
      this.show = false;
    },
    async generateWords() {
      console.log("Generating word list from GPT");
      this.showLoading = true;

      let apiKey = "c2stcHJvai15cUFsY3JwS1JEMWlkLWU4MHFBSzRHUmRVckYwYlZNemtXSEZNeVFBZ1JCeHBRNm9fZlowY29OeW5xVDNCbGJrRkpnMkFpVVoycjNPb0trYm5QSmlkSm5xTUloMFBmRXg2a2pCcHFkdGVmaGhlbVduNEhhSGZjWkowSGNB";
      const decodedStr = atob(apiKey);

      const openai = new OpenAI({
        apiKey: decodedStr,
        dangerouslyAllowBrowser: true,
      });

      const prompt = `You are an English teacher helping the user create a list of words for a topic.
      Given the topic: "${this.inputWord}", generate a list of 20 English words related to this topic.
      Return the result as a JSON array of strings.`;

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are a helpful English teacher." },
            { role: "user", content: prompt },
          ],
        });

        const message = response.choices[0].message.content;
        console.log("Word list from GPT:", message);

        this.wordList = JSON.parse(message);
        this.loadNextQuestion();
      } catch (error) {
        console.error("Error interacting with OpenAI:", error);
      } finally {
        this.showLoading = false;
      }
    },
    async loadNextQuestion() {
  if (this.wordList.length === 0) {
    this.currentQuestion = null;
    alert("All questions completed!");
    return;
  }

  const word = this.wordList.shift();

  let apiKey = "c2stcHJvai15cUFsY3JwS1JEMWlkLWU4MHFBSzRHUmRVckYwYlZNemtXSEZNeVFBZ1JCeHBRNm9fZlowY29OeW5xVDNCbGJrRkpnMkFpVVoycjNPb0trYm5QSmlkSm5xTUloMFBmRXg2a2pCcHFkdGVmaGhlbVduNEhhSGZjWkowSGNB";
  const decodedStr = atob(apiKey);

  const openai = new OpenAI({
    apiKey: decodedStr,
    dangerouslyAllowBrowser: true,
  });


  const prompt = `You are an English teacher helping the user create a multiple-choice question.
Given the word: "${word}", generate a JSON object as follows:
{
  "chineseTranslation": "", 
  "options": ["", "", "", ""],
  "correctAnswer": ""
}.
The "options" should include three incorrect english words as distractors along with the correct english word.
The distractors should be plausible but clearly incorrect.
Return only the JSON object without any additional text or explanation.The "chineseTranslation" should be the Chinese translation of the word,use zh-tw.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful English teacher." },
        { role: "user", content: prompt },
      ],
    });

    const message = response.choices[0].message.content;
    console.log("Raw Question Data from GPT:", message);

    try {
      this.currentQuestion = JSON.parse(message);
    } catch (jsonError) {
      console.error("JSON Parsing Error:", jsonError);
      console.log("Fallback to display raw response for debugging.");
      this.currentQuestion = {
        chineseTranslation: "Invalid response. Check GPT output.",
        options: ["Error", "Error", "Error", "Error"],
        correctAnswer: "Error",
      };
    }
  } catch (error) {
    console.error("Error interacting with OpenAI:", error);
  }
}
    ,
    handleAnswer(selectedOption, index) {
      this.selectedOptionIndex = index;
      this.isSelectedCorrect = selectedOption === this.currentQuestion.correctAnswer;

      setTimeout(() => {
        this.isSelectedCorrect = false;
        this.selectedOptionIndex = null;
        this.loadNextQuestion();
      }, 2000);
    },
  },
};
</script>

<style>
.word-card__question-title {
  font-size: 24px;
  text-align: center;
  margin-bottom: 20px;
}
.word-card__options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
}
.word-card__options button {
  padding: 10px 20px;
  font-size: 18px;
  border: none;
  border-radius: 8px;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}
.word-card__options button:hover {
  background-color: #e0e0e0;
}
.correct {
  background-color: green !important;
  color: white;
}
</style>

<style scoped>
.correct {
  background-color: green;
  color: white;
}
.card-block {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #f5f5f5;
}

.word-card {
  border: 1px solid #ddd;
  padding: 20px;
  width: 300px;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.word-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.word-card__input,
.word-card__button {
  margin-top: 10px;
}

.word-card__close {
  width: 30px;
  height: 30px;
  border: none;
  background-color: transparent;
  color: black;
  font-size: larger;
}

.word-card__result {
  margin-top: 15px;
  border-top: 1px solid #ddd;
  padding-top: 10px;
}

.loading-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}
</style>