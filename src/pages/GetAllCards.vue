<template>
    <div class="cards-wrapper">
      <div v-if="loading" class="loading">載入中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="cards-container">
        <div v-for="card in cards" :key="card.id" class="card">
          <h2>{{ card.word }}</h2>
          <p><strong>翻譯：</strong>{{ card.translation }}</p>
          <p><strong>例句：</strong>{{ card.exampleSentence }}</p>
          <p><strong>詞性：</strong>{{ card.partOfSpeech }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        cards: [], // 用於存儲從後端獲取的字卡數據
        loading: true, // 加載狀態
        error: null, // 錯誤信息
      };
    },
    async created() {
      try {
        // 發送 GET 請求到後端 API
        const response = await fetch("http://localhost:8080/api/cards");
        if (!response.ok) {
          throw new Error("無法取得字卡數據");
        }
  
        // 獲取 JSON 數據
        const data = await response.json();
  
        // 在控制台打印出數據
        console.log("從後端獲取的字卡數據：", data);
  
        // 將數據存儲到 cards 中以供展示
        this.cards = data;
      } catch (error) {
        // 捕獲並存儲錯誤信息
        this.error = error.message;
        console.error("獲取字卡數據時發生錯誤：", error);
      } finally {
        // 無論成功或失敗，結束加載狀態
        this.loading = false;
      }
    },
  };
  </script>
  
  <style scoped>
  .cards-wrapper {
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .loading {
    font-size: 20px;
    color: #555;
  }
  
  .error {
    font-size: 20px;
    color: red;
  }
  
  .cards-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .card {
    background-color: #fff7f5;
    border: 1px solid #ff6f61;
    border-radius: 8px;
    padding: 10px;
    width: 250px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .card h2 {
    color: #ff6f61;
    font-size: 20px;
    margin-bottom: 10px;
  }
  
  .card p {
    font-size: 16px;
    margin: 5px 0;
  }
  </style>
  