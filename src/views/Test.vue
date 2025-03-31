<template>
    <div class="test">
      <h1>Test Page</h1>
      <p>Current count: {{ count }}</p>
      <button @click="increment">Increment</button>
      <button @click="reset">Reset</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        count: 0
      };
    },
    methods: {
      increment() {
        this.count++;
      },
      reset() {
        this.count = 0;
      }
    }
  };
  </script>
  
  <style scoped>
  .test {
    text-align: center;
    margin-top: 50px;
  }
  
  button {
    margin: 5px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }
  </style>
  