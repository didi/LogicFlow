<template>
  <div class="diagram-panel">
    <div class="setting-block">
      <div>快捷样式</div>
      <div class="short-styles">
        <div
          v-for="(item, index) in shortStyles"
          :key="index"
          :style="{ 'backgroundColor': item.backgroundColor, 'borderColor': item.borderColor, 'borderWidth': item.borderWidth }"
          @click="setStyle(item)"
        >
        </div>
      </div>
    </div>
    <div class="setting-block">
      <div class="setting-item">
        <span>背景色</span>
        <el-popover
          placement="top-start"
          title="填充样式"
          width="220"
          trigger="click"
        >
          <sketch-picker :value="style.backgroundColor" @input="(c) => $_changeColorProperty(c, 'backgroundColor')"/>
          <div class="border-color" :style='{"backgroundColor": style.backgroundColor}' slot="reference"></div>
        </el-popover>
        <span>背景渐变色</span>
        <el-popover
          placement="top-start"
          title="填充样式"
          width="220"
          trigger="click"
        >
          <sketch-picker :value="style.gradientColor" @input="(c) => $_changeColorProperty(c, 'gradientColor')"/>
          <div class="border-color" :style='{"backgroundColor": style.gradientColor}' slot="reference"></div>
        </el-popover>
      </div>
      <div class="setting-item">
        <span>线条样式</span>
        <el-select v-model="style.borderStyle" size="small" @change="$_selectBorder">
          <el-option value="hidden" label="不显示"></el-option>
          <el-option
            v-for="(border, index) in borderStyles"
            :value="border.value"
            :key="index"
          >
            <div class="border-style" :style="{ 'borderBottomStyle': border.value}"></div>
          </el-option>
        </el-select>
      </div>
      <div class="setting-item">
        <span>线条颜色</span>
        <el-popover
          placement="top-start"
          title="填充样式"
          width="220"
          trigger="click"
        >
          <sketch-picker :value="style.borderColor"  @input="(c) => $_changeColorProperty(c, 'borderColor')"/>
          <div class="border-color" :style='{"backgroundColor": style.borderColor}' slot="reference"></div>
        </el-popover>
      </div>
      <div class="setting-item">
        <span>线条宽度</span>
        <el-select v-model="style.borderWidth" @change="$_changeBorderWidth">
          <el-option
            v-for="item in borderWidthOptions"
            :key="item"
            :label="`${item}px`"
            :value="item"
          ></el-option>
        </el-select>
      </div>
      <div class="setting-item">
        <span>文本颜色</span>
        <el-popover
          placement="top-start"
          title="填充样式"
          width="220"
          trigger="click"
        >
          <sketch-picker :value="style.fontColor" @input="(c) => $_changeColorProperty(c, 'fontColor')"/>
          <div class="border-color" :style='{"backgroundColor": style.fontColor}' slot="reference"></div>
        </el-popover>
      </div>
      <div class="setting-item">
        <span>文本大小</span>
        <el-input-number
          v-model="style.fontSize"
          controls-position="right"
          size="mini"
          @change="$_changeFontSize"
          :min="12"
          :max="30">
        </el-input-number>
        <span>px</span>
      </div>
      <div class="setting-item">
        <span>文本字体</span>
        <el-select v-model="style.fontFamily" size="small" @change="$_changeFontFamily">
          <el-option
            v-for="(fontFamily, index) in fontFamilies"
            :value="fontFamily.value"
            :key="index"
          ></el-option>
        </el-select>
      </div>
      <div class="setting-item">
        <span>行高</span>
        <el-select v-model="style.lineHeight" size="small" @change="$_changeLineHeight">
          <el-option
            v-for="(item, index) in lineHeightOptions"
            :key="index"
            :label="`${item}`"
            :value="item"
          ></el-option>
        </el-select>
      </div>
      <div class="setting-item">
        <span>对齐</span>
        <el-radio-group v-model="style.textAlign" size="small" @change="$_changeTextAlign">
          <el-radio-button label="left">左对齐</el-radio-button>
          <el-radio-button label="center">居中</el-radio-button>
          <el-radio-button label="right">右对齐</el-radio-button>
        </el-radio-group>
      </div>
      <div class="setting-item">
        <span>文本样式</span>
        <el-button size="small" @click="$_changeFontWeight">B</el-button>
        <el-button size="small" @click="$_changeTextDecoration">U</el-button>
        <el-button size="small" @click="$_changeFontStyle">I</el-button>
      </div>
      <div>
        <el-button @click="$emit('setZIndex', 'top')">置为顶部</el-button>
        <el-button @click="$emit('setZIndex', 'bottom')">置为底部</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { Sketch } from 'vue-color'
import { shortStyles, borderStyles, fontFamilies } from '../constant'

export default {
  props: {
    elementsStyle: Object,
    onlyEdge: Boolean // 是否是只设置边的属性，当只设置边的属性时，隐藏快捷样式和背景色设置
  },
  data () {
    return {
      shortStyles,
      borderStyles,
      fontFamilies,
      style: {
        backgroundColor: '', // 填充色
        gradientColor: '', // 渐变色
        borderType: 0, // 线条类型
        borderColor: '', // 填充颜色
        borderWidth: 1, // 线条宽度
        borderStyle: '', // 线条类型
        fontSize: 12, // 文本大小
        fontColor: '', // 文本颜色
        fontWeight: '', // 文本加粗
        fontFamily: '', // 文本样式
        lineHeight: '', // 行高
        textAlign: '' // 对齐
      },
      borderWidthOptions: Array(11).fill().map((_, i) => i),
      SketchPicker: Sketch,
      fontWeight: '', // 文本加粗
      lineHeightOptions: Array(5).fill(1).map((_, i) => _ + i * 0.5)
    }
  },
  watch: {
    elementsStyle: {
      handler (val) {
        this.style = { ...this.style, ...val }
      },
      immediate: true
    }
  },
  methods: {
    setStyle (item) {
      this.$emit('setStyle', item)
    },
    $_selectBorder (val) {
      this.$emit('setStyle', {
        borderStyle: val
      })
    },
    $_changeColorProperty ({ rgba: { r, g, b, a } }, type) {
      const color = `rgba(${r},${g},${b},${a})`
      this[type] = color
      this.$emit('setStyle', {
        [type]: color
      })
    },
    $_changeFontSize (val) {
      this.$emit('setStyle', {
        fontSize: val
      })
    },
    $_changeBorderWidth (val) {
      this.$emit('setStyle', {
        borderWidth: val
      })
    },
    $_changeFontFamily (val) {
      this.$emit('setStyle', {
        fontFamily: val
      })
    },
    $_changeLineHeight (val) {
      this.$emit('setStyle', {
        lineHeight: val
      })
    },
    $_changeFontWeight () {
      if (this.style.fontWeight === 'bold') {
        this.$emit('setStyle', {
          fontWeight: 'normal'
        })
      } else {
        this.$emit('setStyle', {
          fontWeight: 'bold'
        })
      }
    },
    $_changeTextDecoration () {
      if (this.style.textDecoration === 'underline') {
        this.$emit('setStyle', {
          textDecoration: 'none'
        })
      } else {
        this.$emit('setStyle', {
          textDecoration: 'underline'
        })
      }
    },
    $_changeFontStyle () {
      if (this.style.fontStyle === 'italic') {
        this.$emit('setStyle', {
          fontStyle: 'normal'
        })
      } else {
        this.$emit('setStyle', {
          fontStyle: 'italic'
        })
      }
    },
    $_changeTextAlign (val) {
      this.$emit('setStyle', {
        textAlign: val
      })
    }
  },
  components: {
    SketchPicker: Sketch
  }
}
</script>

<style scoped>
.diagram-panel {
  padding: 20px;
}
.short-styles {
  width: 240px;
}
.short-styles > div {
  width: 20px;
  height: 20px;
  margin: 0 10px 5px 0;
  box-sizing: border-box;
  float: left;
  border: 1px solid #fff;
  cursor: pointer;
}
.border-style {
  width: 150px;
  height: 0px;
  margin-top: 18px;
  border-bottom-width: 1px;
  border-bottom-color: black;
}
.setting-block {
  overflow: hidden;
}
.setting-item {
  line-height: 12px;
  font-size: 12px;
  display: flex;
  vertical-align: middle;
  align-items: center;
  margin-top: 10px;
}
.setting-item > span {
  width: 50px;
  margin-right: 10px;
  text-align: right;
  flex-shrink: 0;
  flex-grow: 0;
}
.border-color {
  width: 40px;
  height: 30px;
  display: inline-block;
  border: 1px solid #eaeaeb;
}

</style>