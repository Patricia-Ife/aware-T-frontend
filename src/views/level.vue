<script setup>
import { ref, h, onMounted } from "vue";
import { useMessage, NButton, NSpace } from "naive-ui";
import ky from "ky";
import { api } from '../utils'

const showCreateModal = ref(false);
const showEditModal = ref(false);
const levelName = ref("");
const editLevelId = ref("");
const message = useMessage();

const fetchData = async () => {
  const result = await api.get("level").json();
  data.value = result.map((r) => ({
    id: r.id,
    name: r.name,
    nbStudents: r.students.length,
    nbCourses: r.courses.length,
  }));
};

const cancel = () => {
  message.success("Cancel");
};
const createLevel = async () => {
  const options = {
    json: { name: levelName.value },
  };

  const level = await api.post("level", options).json();
  message.success("Level created successfully");
  await fetchData();
};
const editLevel = async (level) => {
  const options = {
    json: { name: levelName.value },
  };

  const result = await api.put("level/" + editLevelId.value, options).json();
  message.success("Level edited successfully");
  await fetchData();
};

const deleteLevel = async (level) => {
  const result = await api.delete("level/" + level.id).json();
  message.success("Level deleted successfully");
  await fetchData();
};

const columns = [
  {
    title: "Name",
    key: "name",
  },
  {
    title: "Number of Students",
    key: "nbStudents",
  },
  {
    title: "Number of Courses",
    key: "nbCourses",
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
                  editLevelId.value = row.id;
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
                onClick: () => deleteLevel(row),
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
        Add Level
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
    title="Create a level"
    positive-text="Submit"
    negative-text="Cancel"
    @positive-click="createLevel"
    @negative-click="cancel"
  >
    Name: <n-input v-model:value="levelName" placeholder="Level Name" />
  </n-modal>
  <n-modal
    v-model:show="showEditModal"
    preset="dialog"
    title="Edit a level"
    positive-text="Edit"
    negative-text="Cancel"
    @positive-click="editLevel"
    @negative-click="cancel"
  >
    Name: <n-input v-model:value="levelName" placeholder="Level Name" />
  </n-modal>
</template>
