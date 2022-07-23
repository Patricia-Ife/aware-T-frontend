<script setup>
import { ref, h, onMounted } from "vue";
import { useMessage, NButton, NSpace, NTag } from "naive-ui";
import ky from "ky";
import { api } from '../utils'

const showCreateModal = ref(false);
const showEditModal = ref(false);
const levelName = ref("");
const semesterYear = ref(null);
const semesterYearOptions = ref([]);
const editSemesterId = ref("");
const message = useMessage();

const fetchData = async () => {
  data.value = await api.get("semester").json();
  const years = await api.get("year").json();
  semesterYearOptions.value = years.map((year) => ({
    label: year.name,
    value: year.id,
  }));
};

const cancel = () => {
  message.success("Cancel");
};
const createSemester = async () => {
  const options = {
    json: { name: levelName.value, year_id: semesterYear.value },
  };

  const semester = await api.post("semester", options).json();
  message.success("Semester created successfully");
  await fetchData();
};
const editSemester = async (semester) => {
  const options = {
    json: { name: levelName.value, year_id: semesterYear.value },
  };

  const result = await api.put("semester/" + editSemesterId.value, options).json();
  message.success("Semester edited successfully");
  await fetchData();
};

const deleteSemester = async (semester) => {
  const result = await api.delete("semester/" + semester.id).json();
  message.success("Semester deleted successfully");
  await fetchData();
};

const columns = [
  {
    title: "Name",
    key: "name",
  },
  {
      title: 'Year',
      key: 'year',
      render (row) {
          return h(
            NTag,
            {
              style: {
                marginRight: '6px'
              },
              type: 'info'
            },
            {
              default: () => row.year.name
            }
          )
        }
    },
  {
    title: "Action",
    key: "actions",
    render(row) {
      return h(
        NSpace,
        { justify: "center" },
        {
          default: () => [
            h(
              NButton,
              {
                size: "small",
                type: "info",
                onClick: () => {
                  levelName.value = row.name;
                  semesterYear.value = row.year.id;
                  editSemesterId.value = row.id;
                  showEditModal.value = true;
                },
              },
              { default: () => "Edit" }
            ),
            h(
              NButton,
              {
                size: "small",
                type: "error",
                onClick: () => deleteSemester(row),
              },
              { default: () => "Delete" }
            ),
          ],
        }
      );
    },
  },
];

const data = ref([]);

onMounted(async () => {
  await fetchData();
});
</script>

<template>
  <n-space vertical :size="12">
    <n-space justify="center">
      <n-button type="primary" @click="showCreateModal = true">
        Add Semester
      </n-button>
    </n-space>
    <n-data-table
      :bordered="false"
      :single-line="false"
      :columns="columns"
      :data="data"
    />
  </n-space>
  <n-modal
    v-model:show="showCreateModal"
    preset="dialog"
    title="Create a semester"
    positive-text="Submit"
    negative-text="Cancel"
    @positive-click="createSemester"
    @negative-click="cancel"
  >
    Name: <n-input v-model:value="levelName" placeholder="Semester Name" />
    Year:
    <n-select
      v-model:value="semesterYear"
      :options="semesterYearOptions"
      placeholder="Semester Year"
    />
  </n-modal>
  <n-modal
    v-model:show="showEditModal"
    preset="dialog"
    title="Edit a semester"
    positive-text="Edit"
    negative-text="Cancel"
    @positive-click="editSemester"
    @negative-click="cancel"
  >
    Name: <n-input v-model:value="levelName" placeholder="Semester Name" />
    Year:
    <n-select
      v-model:value="semesterYear"
      :options="semesterYearOptions"
      placeholder="Semester Year"
    />
  </n-modal>
</template>
