<template>
  <div class="websocket">
    <h1>This is an websocket page</h1>
    <ul class="websocket__btns">
      <li>
        <button
          :disabled="isSubscribed"
          @click="subscribe"
        >Start</button>
      </li>
      <li>
        <button
          :disabled="!isSubscribed"
          @click="unsubscribe"
        >Stop</button>
      </li>
      <li>
        <button @click="clear">Clear</button>
      </li>
    </ul>
    <div
      v-if="transactions.length"
      class="websocket__content"
    >
      <table>
        <caption>Total amount: {{ amount / 100000000 }}BTC</caption>
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Sum</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="transaction in transactions"
            :key="transaction.hash"
          >
            <td>{{ transaction.inputs.map(i => i.prev_out.addr).join('\n') }}</td>
            <td>{{ transaction.out.map(o => o.addr).join('\n') }}</td>
            <td>{{ transaction.sum / 100000000 }}BTC</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { WEBSOCKET } from '@/helper/config';

const WEBSOCKET_MESSAGE_TYPES = {
  utx: 'onUnconfirmedTransaction'
};
export default {
  name: 'Websocket',
  data() {
    return {
      socket: {},
      isSubscribed: false,
      transactions: []
    };
  },

  computed: {
    amount() {
      return this.transactions.reduce((res, el) => {
        return res + el.sum;
      }, 0);
    }
  },

  mounted() {
    this.init();
  },

  methods: {
    init() {
      this.socket = new WebSocket(WEBSOCKET.URL_WSS);
      this.socket.onopen = () => {
        this.socket.onmessage = this.onNewMsg;
      };
    },

    // Processing only necessary messages
    onNewMsg(msg) {
      const msgBody = JSON.parse(msg.data);
      if (
        Object.prototype.hasOwnProperty.call(WEBSOCKET_MESSAGE_TYPES, msgBody.op)
      ) {
        return this[WEBSOCKET_MESSAGE_TYPES[msgBody.op]](msgBody);
      }
    },

    // Save the new transaction
    onUnconfirmedTransaction(data) {
      return this.transactions.push({
        hash: data.x.hash,
        inputs: data.x.inputs,
        out: data.x.out,
        sum: data.x.out.reduce((res, o) => {
          return res + o.value;
        }, 0)
      });
    },

    sendSocketMsg(data) {
      return this.socket.send(data);
    },

    subscribe() {
      this.isSubscribed = true;
      this.sendSocketMsg(WEBSOCKET.SUBSCRIBE);
    },

    unsubscribe() {
      this.isSubscribed = false;
      this.sendSocketMsg(WEBSOCKET.UNSUBSCRIBE);
    },

    clear() {
      this.transactions.splice(0);
    }
  }
};
</script>

<style lang="sass" scoped>
.websocket__btns
  padding: 0
  display: flex
  justify-content: center
  align-items: center
  list-style: none
  button
    margin: 15px
.websocket__content
  caption
    font-size: 2rem
    margin-bottom: 1rem
  table
    width: 100%
    border-collapse: collapse
    text-align: left
  td, th
    padding: 10px
  tr
    border-bottom: 1px solid #333
</style>
