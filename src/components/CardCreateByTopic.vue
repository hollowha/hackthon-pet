<template>
  <div class="container">
    <div class="card-block">
      <div v-if="show" class="word-card">
        <div class="word-card__content">
          <input
            type="text"
            class="word-card__input"
            placeholder="輸入主題"
            v-model="inputWord"
            @keyup.enter="generateWords"
          />
          <button
            class="word-card__button"
            :disabled="empty"
            @click="generateWords"
          >
            生成單字卡
          </button>
        </div>
      </div>

      <div v-if="currentQuestion" class="word-card__question">
        <h2 class="word-card__question-title">
          {{ currentQuestion.chineseTranslation }}
        </h2>
        <div class="word-card__options">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            :class="{
              'correct': isSelectedCorrect && selectedOptionIndex === index,
              'incorrect': !isSelectedCorrect && selectedOptionIndex === index,
            }"
            class="word-card__option"
            @click="handleAnswer(option, index)"
          >
            <span class="option-text">{{ option }}</span>
            <img
              v-if="selectedOptionIndex === index"
              :src="isSelectedCorrect ? '/cardimg/correct.png' : '/cardimg/wrong.png'"
              class="result-icon"
            />
          </button>
        </div>
      </div>

      <!-- Progress Bar -->
      <div v-if="!show" class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <div class="progress-text">{{ questionsAnswered }} / 10</div>
      </div>

      <div v-if="showLoading" class="loading-modal">
        <div class="loading-content">
          <div class="loading-spinner">
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
          </div>
          <p class="loading-text">Loading...</p>
        </div>
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
      questionsAnswered: 0,
    };
  },
  computed: {
    empty() {
      return !this.inputWord;
    },
    progressPercentage() {
      return (this.questionsAnswered / 10) * 100;
    }
  },
  methods: {
    async generateWords() {
      console.log("Generating word list from GPT");
      this.showLoading = true;

      const apiKey = process.env.VUE_APP_OPENAI_API_KEY;

      const openai = new OpenAI({
        apiKey: apiKey,
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
        this.show = false;
        
        this.$nextTick(async () => {
          await this.loadNextQuestion();
        });
      } catch (error) {
        console.error("Error interacting with OpenAI:", error);
        this.showLoading = false;
      }
    },

    async loadNextQuestion() {
      this.showLoading = true;

      if (this.questionsAnswered >= 10) {
        console.log("測驗結束");
        alert("測驗結束！");
        this.showLoading = false;
        return;
      }

      if (this.wordList.length === 0) {
        this.currentQuestion = null;
        alert("All questions completed!");
        this.showLoading = false;
        return;
      }

      const word = this.wordList.shift();

      try {
        const response = await fetch(
          `http://localhost:8080/api/correct/check?word=${encodeURIComponent(word)}`,
          {
            method: "POST",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const isWordAnswered = await response.json();

        if (isWordAnswered) {
          console.log(`Skipping word: ${word}`);
          await this.loadNextQuestion();
          return;
        }

        const apiKey = process.env.VUE_APP_OPENAI_API_KEY;

        const openai = new OpenAI({
          apiKey: apiKey,
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
        Return only the JSON object without any additional text or explanation. The "chineseTranslation" should be the Chinese translation of the word, use zh-tw.`;

        const gptResponse = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are a helpful English teacher." },
            { role: "user", content: prompt },
          ],
        });

        const message = gptResponse.choices[0].message.content;
        console.log("Question data from GPT:", message);

        try {
          this.currentQuestion = JSON.parse(message);
          this.questionsAnswered += 1;
          this.showLoading = false;
        } catch (jsonError) {
          console.error("JSON Parsing Error:", jsonError);
          console.log("Fallback: Skipping to the next question.");
          await this.loadNextQuestion();
        }
      } catch (error) {
        console.error("Error loading question:", error);
        this.showLoading = false;
        await this.loadNextQuestion(); 
      }
    },

    async handleAnswer(selectedOption, index) {
      this.selectedOptionIndex = index;
      this.isSelectedCorrect = selectedOption === this.currentQuestion.correctAnswer;

      const word = this.currentQuestion.correctAnswer;

      try {
        const endpoint = this.isSelectedCorrect
          ? "http://localhost:8080/api/correct/add"
          : "http://localhost:8080/api/incorrect/add";

        await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ word }),
        });

        console.log(
          this.isSelectedCorrect
            ? `Added to correct database: ${word}`
            : `Added to incorrect database: ${word}`
        );
      } catch (error) {
        console.error("Error updating word database:", error);
      }

      setTimeout(async () => {
        this.isSelectedCorrect = false;
        this.selectedOptionIndex = null;
        await this.loadNextQuestion();
      }, 2000);
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f4f4f4;
  padding-bottom: 200px;
}

.card-block {
  width: 100%;
  max-width: 500px;
}

.word-card {
  background-color: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.word-card__input {
  width: 90%;
  padding: 12px 15px;
  margin-bottom: 15px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: border-color 0.3s ease;
}

.word-card__input:focus {
  outline: none;
  border-color: #4caf50;
}

.word-card__button {
  width: 100%;
  background: linear-gradient(135deg, #4caf50, #81c784);
  border: none;
  color: white;
  padding: 12px 20px;
  font-size: 18px;
  border-radius: 8px;
  cursor: pointer;
}

.word-card__button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.word-card__question {
  background-color: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.word-card__question-title {
  font-size: 24px;
  margin-bottom: 25px;
  color: #333;
  text-align: center;
}

.word-card__options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.word-card__option {
  width: 100%;
  padding: 15px 20px;
  font-size: 18px;
  border: none;
  border-radius: 10px;
  background-color: #f0f0f0;
  cursor: pointer;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.option-text {
  flex-grow: 1;
  text-align: left;
  margin-right: 10px;
}

.word-card__option:hover {
  background-color: #e0e0e0;
}

.correct {
  background-color: #4CAF50 !important;
  color: white;
}

.incorrect {
  background-color: #F44336 !important;
  color: white;
}

.result-icon {
  width: 25px;
  height: 25px;
}

.progress-container {
  position: fixed;
  bottom: 100px;
  left: 0;
  width: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 900;
}

.progress-bar {
  width: 90%;
  max-width: 600px;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-text {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.loading-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.loading-content {
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.loading-dot {
  width: 15px;
  height: 15px;
  background-color: #ff6f61;
  border-radius: 50%;
  margin: 0 8px;
  animation: bounce 0.5s ease-in-out infinite alternate;
}

.loading-dot:nth-child(2) {
  animation-delay: 0.1s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0.2s;
}

.loading-text {
  color: #000000;
  font-weight: 600;
  font-size: large;
  letter-spacing: 1px;
  text-transform: uppercase;
}

@keyframes bounce {
  0% {
    transform: translateY(0);
    opacity: 0.6;
  }
  100% {
    transform: translateY(-15px);
    opacity: 1;
  }
}

@media (max-width: 600px) {
  .word-card__options {
    grid-template-columns: 1fr;
  }
  
  .progress-container {
    padding: 10px;
  }
  
  .progress-bar {
    width: 85%;
  }
  
  .progress-text {
    font-size: 12px;
  }
}
</style>