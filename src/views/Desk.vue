<template>
  <div class="desk">
    <h1>This is an Desk page</h1>
    <div
      v-if="tiles.length"
      ref="tiles"
      class="desk__tiles"
    >
      <vue-draggable-resizable
        v-for="tile in activeTiles"
        :key="tile.id"
        class="desk__tile"
        :grid="[10,10]"
        :w="tile.width"
        :h="tile.height"
        :x="tile.x"
        :y="tile.y"
        :z="tile.zIndex"
        :min-height="100"
        :min-width="100"
        :parent="true"
        drag-handle=".desk__tile"
        @resizing="onResize(tile, ...arguments)"
        @dragging="onDrag(tile, ...arguments)"
        @activated="tile.zIndex = maxZIndex + 1"
      >
        <div
          class="desk__tile-content"
          :data-id="tile.id"
        >
          <div class="desk__tile-head">
            <h3>Tile {{ tile.id }}</h3>
            <button @click="closeTile(tile)">Close</button>
          </div>
        </div>
      </vue-draggable-resizable>
      <ul class="desk__tiles-closed">
        <li
          v-for="tile in inactiveTiles"
          :key="tile.id"
        >
          <button @click="restoreTile(tile)">Restore Tile {{ tile.id }}</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import VueDraggableResizable from 'vue-draggable-resizable';
import { TILE } from '@/helper/defaults';
import storageAvailable from '@/helper/storageAvailable';

export default {
  name: 'Desk',
  components: { VueDraggableResizable },
  data() {
    return {
      tiles: [],
      isLocalStorageAvailable: true // Be optimistic
    };
  },

  computed: {
    activeTiles() {
      return this.tiles.filter((tile) => tile.isActive);
    },

    inactiveTiles() {
      return this.tiles.filter((tile) => !tile.isActive);
    },

    maxZIndex() {
      const zIndexes = this.tiles.map((tile) => tile.zIndex) || [0];
      return Math.max(...zIndexes);
    }
  },

  mounted() {
    this.init();
  },

  methods: {
    init() {
      this.isLocalStorageAvailable = storageAvailable('localStorage');
      this.tiles = this.getInitTilesData();
    },

    getInitTilesData() {
      let tiles = JSON.parse(localStorage.getItem('tiles'));
      if (!tiles || !Array.isArray(tiles.data) || tiles.data.length < 5) {
        return this.getDefaultTilesData();
      }
      return tiles.data;
    },

    getDefaultTilesData() {
      const data = [];
      for (let i = 0; i < TILE.COUNT; i++) {
        data.push({
          id: i + 1,
          isActive: true,
          zIndex: i,
          width: TILE.WIDTH,
          height: TILE.HEIGHT,
          x: i * (TILE.WIDTH + TILE.PADDING),
          y: 0
        });
      }
      return data;
    },

    onDrag(tile, x, y) {
      tile.x = x;
      tile.y = y;
      this.saveTilesToLocalStorage();
    },

    onResize(tile, x, y, width, height) {
      tile.x = x;
      tile.y = y;
      tile.width = width;
      tile.height = height;
      this.saveTilesToLocalStorage();
    },

    closeTile(tile) {
      tile.isActive = false;
      this.saveTilesToLocalStorage();
    },

    restoreTile(tile) {
      const x = (this.$refs.tiles.clientWidth - TILE.WIDTH) / 2;
      const y = (this.$refs.tiles.clientHeight - TILE.HEIGHT) / 2;
      tile.isActive = true;
      tile.zIndex = this.maxZIndex + 1;
      tile.width = TILE.WIDTH;
      tile.height = TILE.HEIGHT;
      tile.x = Math.round(x / 10) * 10; // Use round to fit into grid
      tile.y = Math.round(y / 10) * 10;
      this.saveTilesToLocalStorage();
    },

    saveTilesToLocalStorage() {
      if (!this.isLocalStorageAvailable) return;
      localStorage.setItem('tiles', JSON.stringify({ data: this.tiles }));
    }
  }
};
</script>

<style lang="sass" scoped>
.desk
  display: flex
  flex-direction: column
  min-height: calc(100vh - 100px)
  h1
    margin-bottom: 30px
.desk__tiles
  flex-grow: 1
  position: relative
  width: 100%
.desk__tile
  position: absolute
  display: block
  width: 100%
  height: 100px
  top: 0
  left: 0
  background-color: #ddd
.desk__tiles-closed
  position: absolute
  bottom: 0
  left: 0
  z-index: 9
</style>
