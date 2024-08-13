<template>
  <div class="element-ui-node">
    <p>element-ui</p>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-divider />
        <div class="demo-button">
          <el-text class="mx-1" type="primary">el-button：</el-text>
          <div class="mb-4">
            <el-button>Default</el-button>
            <el-button type="primary">Primary</el-button>
            <el-button type="success">Success</el-button>
            <el-button type="info">Info</el-button>
            <el-button type="warning">Warning</el-button>
            <el-button type="danger">Danger</el-button>
          </div>
          <div class="mb-4">
            <el-button plain>Plain</el-button>
            <el-button type="primary" plain>Primary</el-button>
            <el-button type="success" plain>Success</el-button>
            <el-button type="info" plain>Info</el-button>
            <el-button type="warning" plain>Warning</el-button>
            <el-button type="danger" plain>Danger</el-button>
          </div>
          <div class="mb-4">
            <el-button round>Round</el-button>
            <el-button type="primary" round>Primary</el-button>
            <el-button type="success" round>Success</el-button>
            <el-button type="info" round>Info</el-button>
            <el-button type="warning" round>Warning</el-button>
            <el-button type="danger" round>Danger</el-button>
          </div>
          <div>
            <el-button :icon="Search" circle />
            <el-button type="primary" :icon="Edit" circle />
            <el-button type="success" :icon="Check" circle />
            <el-button type="info" :icon="Message" circle />
            <el-button type="warning" :icon="Star" circle />
            <el-button type="danger" :icon="Delete" circle />
          </div>
        </div>
        <el-divider />
        <el-text class="mx-1" type="primary">el-image：</el-text>
        <div class="demo-image">
          <div class="block" v-for="fit in fits" :key="fit">
            <span class="demonstration">{{ fit }}</span>
            <el-image style="width: 100px; height: 100px" :src="url" :fit="fit"></el-image>
          </div>
        </div>
        <el-divider />
        <el-text class="mx-1" type="primary">el-calendar</el-text>
        <el-calendar v-model="date" />
        <el-divider />
        <el-text class="mx-1" type="primary">el-form</el-text>
        <el-form :model="form" label-width="auto" style="max-width: 600px">
          <el-form-item label="Activity name">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="Activity zone">
            <el-select v-model="form.region" placeholder="please select your zone">
              <el-option label="Zone one" value="shanghai" />
              <el-option label="Zone two" value="beijing" />
            </el-select>
          </el-form-item>
          <el-form-item label="Activity time">
            <el-col :span="11">
              <el-date-picker
                v-model="form.date1"
                type="date"
                placeholder="Pick a date"
                style="width: 100%"
              />
            </el-col>
            <el-col :span="2" class="text-center">
              <span class="text-gray-500">-</span>
            </el-col>
            <el-col :span="11">
              <el-time-picker v-model="form.date2" placeholder="Pick a time" style="width: 100%" />
            </el-col>
          </el-form-item>
          <el-form-item label="Instant delivery">
            <el-switch v-model="form.delivery" />
          </el-form-item>
          <el-form-item label="Activity type">
            <el-checkbox-group v-model="form.type">
              <el-checkbox value="Online activities" name="type"> Online activities</el-checkbox>
              <el-checkbox value="Promotion activities" name="type">
                Promotion activities
              </el-checkbox>
              <el-checkbox value="Offline activities" name="type"> Offline activities</el-checkbox>
              <el-checkbox value="Simple brand exposure" name="type">
                Simple brand exposure
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="Resources">
            <el-radio-group v-model="form.resource">
              <el-radio value="Sponsor">Sponsor</el-radio>
              <el-radio value="Venue">Venue</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Activity form">
            <el-input v-model="form.desc" type="textarea" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">Create</el-button>
            <el-button>Cancel</el-button>
          </el-form-item>
        </el-form>
        <el-divider />
        <el-text class="mx-1" type="primary">el-color-picker</el-text>
        <div class="demo-color-block">
          <span class="demonstration">With default value</span>
          <el-color-picker v-model="color" />
        </div>
        <el-divider />
        <el-text class="mx-1" type="primary">el-slider</el-text>
        <div class="slider-demo-block">
          <el-slider v-model="siderValue" show-input size="large" />
          <el-slider v-model="siderValue" show-input />
          <el-slider v-model="siderValue" show-input size="small" />
        </div>
        <el-divider />
        <el-text class="mx-1" type="primary">el-transfer</el-text>
        <el-transfer v-model="transferValue" :data="transferData" />
      </el-col>
      <el-col :span="12">
        <el-text class="mx-1" type="primary">el-table</el-text>
        <el-table :data="tableData" style="width: 100%" max-height="250">
          <el-table-column fixed prop="date" label="Date" width="150" />
          <el-table-column prop="name" label="Name" width="120" />
          <el-table-column prop="state" label="State" width="120" />
          <el-table-column prop="city" label="City" width="120" />
          <el-table-column prop="address" label="Address" width="600" />
          <el-table-column prop="zip" label="Zip" width="120" />
          <el-table-column fixed="right" label="Operations" min-width="120">
            <template #default="scope">
              <el-button link type="primary" size="small" @click.prevent="deleteRow(scope.$index)">
                Remove
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button class="mt-4" style="width: 100%" @click="onAddItem"> Add Item</el-button>
        <el-divider></el-divider>
        <el-text class="mx-1" type="primary">el-timeline</el-text>
        <el-timeline style="max-width: 600px">
          <el-timeline-item timestamp="2018/4/12" placement="top">
            <el-card>
              <h4>Update Github template</h4>
              <p>Tom committed 2018/4/12 20:46</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2018/4/3" placement="top">
            <el-card>
              <h4>Update Github template</h4>
              <p>Tom committed 2018/4/3 20:46</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2018/4/2" placement="top">
            <el-card>
              <h4>Update Github template</h4>
              <p>Tom committed 2018/4/2 20:46</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <el-text class="mx-1" type="primary">el-statistic</el-text>
        <el-divider></el-divider>
        <el-row>
          <el-col :span="6">
            <el-statistic title="Daily active users" :value="268500" />
          </el-col>
          <el-col :span="6">
            <el-statistic :value="138">
              <template #title>
                <div style="display: inline-flex; align-items: center">
                  Ratio of men to women
                  <el-icon style="margin-left: 4px" :size="12">
                    <Male />
                  </el-icon>
                </div>
              </template>
              <template #suffix>/100</template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="Total Transactions" :value="100" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="Feedback number" :value="562">
              <template #suffix>
                <el-icon style="vertical-align: -0.125em">
                  <ChatLineRound />
                </el-icon>
              </template>
            </el-statistic>
          </el-col>
        </el-row>
        <div>
          <el-text class="mx-1" type="primary">el-popover</el-text>
          <el-divider></el-divider>
          <el-popover
            placement="top-start"
            title="Title"
            :width="200"
            trigger="hover"
            content="this is content, this is content, this is content"
          >
            <template #reference>
              <el-button class="m-2">Hover to activate</el-button>
            </template>
          </el-popover>
          <el-popover
            placement="bottom"
            title="Title"
            :width="200"
            trigger="click"
            content="this is content, this is content, this is content"
          >
            <template #reference>
              <el-button class="m-2">Click to activate</el-button>
            </template>
          </el-popover>
          <el-popover
            ref="popover"
            placement="right"
            title="Title"
            :width="200"
            trigger="focus"
            content="this is content, this is content, this is content"
          >
            <template #reference>
              <el-button class="m-2">Focus to activate</el-button>
            </template>
          </el-popover>
          <el-popover
            ref="popover"
            title="Title"
            :width="200"
            trigger="contextmenu"
            content="this is content, this is content, this is content"
          >
            <template #reference>
              <el-button class="m-2">contextmenu to activate</el-button>
            </template>
          </el-popover>
          <el-popover
            :visible="visible"
            placement="bottom"
            title="Title"
            :width="200"
            content="this is content, this is content, this is content"
          >
            <template #reference>
              <el-button class="m-2" @click="visible = !visible"> Manual to activate</el-button>
            </template>
          </el-popover>
        </div>
        <el-text class="mx-1" type="primary">el-steps</el-text>
        <el-divider></el-divider>
        <el-steps style="max-width: 600px" :active="2" align-center>
          <el-step title="Step 1" description="Some description" />
          <el-step title="Step 2" description="Some description" />
          <el-step title="Step 3" description="Some description" />
        </el-steps>
        <el-divider />
        <el-text class="mx-1" type="primary">el-card</el-text>
        <el-card style="max-width: 480px">
          <template #header>
            <div class="card-header">
              <span>Card name</span>
            </div>
          </template>
          <p v-for="o in 4" :key="o" class="text item">{{ 'List item ' + o }}</p>
          <template #footer>Footer content</template>
        </el-card>
        <el-divider />
        <el-text class="mx-1" type="primary">el-carousel</el-text>
        <el-carousel :interval="4000" type="card" height="200px">
          <el-carousel-item v-for="item in 6" :key="item">
            <h3 text="2xl" justify="center">{{ item }}</h3>
          </el-carousel-item>
        </el-carousel>
        <el-divider />
        <el-text class="mx-1" type="primary">el-progress</el-text>
        <div class="demo-progress">
          <el-progress :percentage="50" :stroke-width="15" striped />
          <el-progress :percentage="30" :stroke-width="15" status="warning" striped striped-flow />
          <el-progress
            :percentage="100"
            :stroke-width="15"
            status="success"
            striped
            striped-flow
            :duration="10"
          />
          <el-progress
            :percentage="percentage"
            :stroke-width="15"
            status="exception"
            striped
            striped-flow
            :duration="duration"
          />
          <el-button-group>
            <el-button :icon="Minus" @click="decrease" />
            <el-button :icon="Plus" @click="increase" />
          </el-button-group>
        </div>
        <el-row>
          <el-col :sm="12" :lg="6">
            <el-result
              icon="success"
              title="Success Tip"
              sub-title="Please follow the instructions"
            >
              <template #extra>
                <el-button type="primary">Back</el-button>
              </template>
            </el-result>
          </el-col>
          <el-col :sm="12" :lg="6">
            <el-result
              icon="warning"
              title="Warning Tip"
              sub-title="Please follow the instructions"
            >
              <template #extra>
                <el-button type="primary">Back</el-button>
              </template>
            </el-result>
          </el-col>
          <el-col :sm="12" :lg="6">
            <el-result icon="error" title="Error Tip" sub-title="Please follow the instructions">
              <template #extra>
                <el-button type="primary">Back</el-button>
              </template>
            </el-result>
          </el-col>
          <el-col :sm="12" :lg="6">
            <el-result icon="info" title="Info Tip">
              <template #sub-title>
                <p>Using slot as subtitle</p>
              </template>
              <template #extra>
                <el-button type="primary">Back</el-button>
              </template>
            </el-result>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>
<script setup lang="ts">
import {
  ElButton,
  ElImage,
  ElText,
  ElDivider,
  ElCalendar,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElCol,
  ElDatePicker,
  ElTimePicker,
  ElSwitch,
  ElCheckboxGroup,
  ElCheckbox,
  ElRadioGroup,
  ElRadio,
  ElMessage,
  ElColorPicker,
  ElSlider,
  ElTransfer,
  ElCard,
  ElCarousel,
  ElCarouselItem,
  ElProgress,
  ElButtonGroup,
  ElResult,
  ElRow,
  ElTable,
  ElTableColumn,
  ElTimeline,
  ElTimelineItem,
  ElStatistic,
  ElIcon,
  ElPopover,
  ElSteps,
  ElStep
} from 'element-plus'
import { reactive, ref, computed } from 'vue'
import {
  Check,
  Delete,
  Edit,
  Message,
  Search,
  Star,
  Minus,
  Plus,
  ChatLineRound,
  Male
} from '@element-plus/icons-vue'

const fits: any = reactive(['fill', 'contain', 'cover', 'none', 'scale-down'])
const url = ref('https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg')
const date = ref(new Date())
const form = reactive({
  name: '',
  region: '',
  date1: '',
  date2: '',
  delivery: false,
  type: [],
  resource: '',
  desc: ''
})
const color = ref('#409EFF')
const siderValue = ref(0)

interface Option {
  key: number
  label: string
  disabled: boolean
}

const generateData = () => {
  const data: Option[] = []
  for (let i = 1; i <= 15; i++) {
    data.push({
      key: i,
      label: `Option ${i}`,
      disabled: i % 4 === 0
    })
  }
  return data
}

const transferData = ref<Option[]>(generateData())
const transferValue = ref([])

const percentage = ref<number>(70)
const duration = computed(() => Math.floor(percentage.value / 10))

const increase = () => {
  percentage.value += 10
  if (percentage.value > 100) {
    percentage.value = 100
  }
}
const decrease = () => {
  percentage.value -= 10
  if (percentage.value < 0) {
    percentage.value = 0
  }
}

const onSubmit = () => {
  ElMessage({
    message: 'submit',
    type: 'success'
  })
}

const tableData = ref([
  {
    date: '2016-05-01',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036'
  },
  {
    date: '2016-05-03',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036'
  }
])

const deleteRow = (index: number) => {
  tableData.value.splice(index, 1)
}

const onAddItem = () => {
  tableData.value.push({
    date: new Date('YYYY-MM-DD').toDateString(),
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036'
  })
}

const visible = ref(false)
</script>
<style scoped>
.element-ui-node {
  width: 2000px;
  background-color: #fff;
}

.demo-image {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.block {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  width: 200px;
}

.demo-color-block {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.demo-color-block .demonstration {
  margin-right: 16px;
}

.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>
