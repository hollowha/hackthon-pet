<template>
  <div class="quiz-block">
    <div v-if="currentQuestion" class="quiz-question">
      <h2 class="quiz-question-title">{{ currentQuestion.chineseTranslation }}</h2>
      <div class="quiz-options">
        <div class="option" 
             v-for="(option, index) in currentQuestion.options" 
             :key="index">
          <button 
            :class="{
              'correct': isSelectedCorrect && selectedOptionIndex === index,
              'incorrect': !isSelectedCorrect && selectedOptionIndex === index
            }" 
            @click="handleAnswer(option, index)">
            {{ option }}
            <img v-if="selectedOptionIndex === index" 
                 :src="isSelectedCorrect ? '/cardimg/correct.png' : '/cardimg/wrong.png'" 
                 class="result-icon" />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
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

    <!-- Progress Bar -->
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }">
          <div class="progress-glow"></div>
        </div>
      </div>
      <div class="progress-text">{{ processedQuestions }} / {{ maxQuestions }}</div>
    </div>
  </div>
</template>

<script>
import OpenAI from "openai";

export default {
  data() {
    return {
      incorrectWords: [],
      currentQuestion: null,
      showLoading: false,
      selectedOptionIndex: null,
      isSelectedCorrect: false,
      processedQuestions: 0,
      maxQuestions: 10,
    };
  },
  computed: {
    progressPercentage() {
      return (this.processedQuestions / this.maxQuestions) * 100;
    }
  },
  mounted() {
    this.fetchIncorrectWords();
  },
  methods: {
    async fetchIncorrectWords() {
      this.showLoading = true;
      try {
        const response = await fetch("http://localhost:8080/api/incorrect/get", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        this.incorrectWords = data.slice(0, this.maxQuestions);
        await this.loadNextQuestion();
      } catch (error) {
        console.error("Error fetching incorrect words:", error);
      }
    },
    async loadNextQuestion() {
      this.showLoading = true;
      
      if (this.processedQuestions >= this.maxQuestions || this.incorrectWords.length === 0) {
        console.log("No more questions.");
        this.currentQuestion = null;
        this.showLoading = false;
        return;
      }

      const wordObj = this.incorrectWords.shift();
      const word = wordObj.word;

      try {
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
        The "options" should include three english incorrect words as distractors along with the correct english word.
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
        try {
          this.currentQuestion = JSON.parse(message);
          this.processedQuestions += 1;
        } catch (jsonError) {
          console.error("JSON Parsing Error:", jsonError);
          await this.loadNextQuestion();
        }
      } catch (error) {
        console.error("Error generating question:", error);
        await this.loadNextQuestion();
      } finally {
        this.showLoading = false;
      }
    },
    async handleAnswer(selectedOption, index) {
      this.selectedOptionIndex = index;
      this.isSelectedCorrect = selectedOption === this.currentQuestion.correctAnswer;

      const word = this.currentQuestion.correctAnswer;

      if (this.isSelectedCorrect) {
        try {
          const response = await fetch(`http://localhost:8080/api/incorrect/reviewed?word=${encodeURIComponent(word)}`, {
            method: "POST",
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          console.log(`Marked as reviewed: ${word}`);
        } catch (error) {
          console.error("Error marking word as reviewed:", error);
        }
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

<style>
.quiz-block {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f4f4f4;
  flex-direction: column;
  padding-bottom: 200px;
}

.quiz-question {
  background-color: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.quiz-question-title {
  font-size: 24px;
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

.quiz-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  width: 100%;
}

.quiz-options .option {
  width: 100%;
}

.quiz-options button {
  width: 100%;
  padding: 15px 20px;
  font-size: 18px;
  border: none;
  border-radius: 10px;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
}

.quiz-options button:hover {
  background-color: #e0e0e0;
}

.quiz-options button.incorrect {
  background-color: #F44336 !important;
  color: white;
}

.quiz-options button.correct {
  background-color: #4CAF50 !important;
  color: white;
}

.result-icon {
  width: 25px;
  height: 25px;
  margin-left: 10px;
}

/* Loading Animation Styles */
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

/* Progress Bar Styles */
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

/* Responsive Design */
@media (max-width: 600px) {
  .quiz-options {
    grid-template-columns: 1fr;
  }
  
  .quiz-question {
    padding: 20px;
    margin: 0 15px;
  }
  
  .quiz-question-title {
    font-size: 20px;
  }
  
  .quiz-options button {
    font-size: 16px;
    padding: 12px 15px;
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