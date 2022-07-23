<script setup>
import { ref, h, onMounted } from "vue";
import { useMessage, NButton, NSpace, NTag } from "naive-ui";
import ky from "ky";
import { api } from '../utils'

const showCreateModal = ref(false);
const showEditModal = ref(false);
const studentName = ref("");
const studentMatricule = ref("");
const studentLevel = ref(null);
const studentLevelOptions = ref([]);
const editStudentId = ref("");
const message = useMessage();

const fetchData = async () => {
  data.value = await api.get("student").json();
  const levels = await api.get("level").json();
  studentLevelOptions.value = levels.map((level) => ({
    label: level.name,
    value: level.id,
  }));
};

const cancel = () => {
  message.success("Cancel");
};
const createStudent = async () => {
  const options = {
    json: {
      name: studentName.value,
      matricule: studentMatricule.value,
      level_id: studentLevel.value,
    },
  };

  const student = await api.post("student", options).json();
  message.success("Student created successfully");
  await fetchData();
};
const editStudent = async (student) => {
  const options = {
    json: {
      name: studentName.value,
      matricule: studentMatricule.value,
      level_id: studentLevel.value,
    },
  };

  const result = await api.put("student/" + editStudentId.value, options).json();
  message.success("Student edited successfully");
  await fetchData();
};

const deleteStudent = async (student) => {
  const result = await api.delete("student/" + student.id).json();
  message.success("Student deleted successfully");
  await fetchData();
};

const columns = [
  {
    title: "Name",
    key: "name",
  },
  {
    title: "Matricule",
    key: "matricule",
  },
  {
    title: "Level",
    key: "level",
    render(row) {
      return h(
        NTag,
        {
          style: {
            marginRight: "6px",
          },
          type: "info",
        },
        {
          default: () => row.level.name,
        }
      );
    },
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
                  console.log(row);
                  studentName.value = row.name;
                  studentMatricule.value = row.matricule;
                  studentLevel.value = row.level.id;
                  editStudentId.value = row.id;
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
                onClick: () => deleteStudent(row),
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
        Add Student
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
    title="Create a student"
    positive-text="Submit"
    negative-text="Cancel"
    @positive-click="createStudent"
    @negative-click="cancel"
  >
    Name:
    <n-input v-model:value="studentName" placeholder="Student Name" />
    Matricule:
    <n-input v-model:value="studentMatricule" placeholder="Student Matricule" />
    Level:
    <n-select
      v-model:value="studentLevel"
      :options="studentLevelOptions"
      placeholder="Student Level"
    />
  </n-modal>
  <n-modal
    v-model:show="showEditModal"
    preset="dialog"
    title="Edit a student"
    positive-text="Edit"
    negative-text="Cancel"
    @positive-click="editStudent"
    @negative-click="cancel"
  >
    Name:
    <n-input v-model:value="studentName" placeholder="Student Name" />
    Matricule:
    <n-input v-model:value="studentMatricule" placeholder="Student Matricule" />
    Level:
    <n-select
      v-model:value="studentLevel"
      :options="studentLevelOptions"
      placeholder="Student Level"
    />
  </n-modal>
</template>
