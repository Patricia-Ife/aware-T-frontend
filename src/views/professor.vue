<script setup>
import { ref, h, onMounted } from "vue";
import { useMessage, NButton, NSpace } from "naive-ui";
import ky from "ky";
import { api } from '../utils'

const showCreateModal = ref(false);
const showEditModal = ref(false);
const professorName = ref("");
const professorEmail = ref("");
const professorPhone = ref("");
const editProfessorId = ref("");
const message = useMessage();

const fetchData = async () => {
  data.value = await api.get("professor").json();
};

const cancel = () => {
  message.success("Cancel");
};
const createProfessor = async () => {
  const options = {
    json: {
      name: professorName.value,
      email: professorEmail.value,
      phone: professorPhone.value,
    },
  };

  const professor = await api.post("professor", options).json();
  message.success("Professor created successfully");
  await fetchData();
};
const editProfessor = async (professor) => {
  const options = {
    json: {
      name: professorName.value,
      email: professorEmail.value,
      phone: professorPhone.value,
    },
  };

  const result = await api.put("professor/" + editProfessorId.value, options).json();
  message.success("Professor edited successfully");
  await fetchData();
};

const deleteProfessor = async (professor) => {
  const result = await api.delete("professor/" + professor.id).json();
  message.success("Professor deleted successfully");
  await fetchData();
};

const columns = [
  {
    title: "Name",
    key: "name",
  },
  {
    title: "Email",
    key: "email",
  },
  {
    title: "Phone",
    key: "phone",
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
                  professorName.value = row.name;
                  professorEmail.value = row.email;
                  professorPhone.value = row.phone;
                  editProfessorId.value = row.id;
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
                onClick: () => deleteProfessor(row),
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
        Add Professor
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
    title="Create a professor"
    positive-text="Submit"
    negative-text="Cancel"
    @positive-click="createProfessor"
    @negative-click="cancel"
  >
    Name:
    <n-input v-model:value="professorName" placeholder="Professor Name" />
    Email:
    <n-input v-model:value="professorEmail" placeholder="Professor Email" />
    Phone:
    <n-input v-model:value="professorPhone" placeholder="Professor Phone" />
  </n-modal>
  <n-modal
    v-model:show="showEditModal"
    preset="dialog"
    title="Edit a professor"
    positive-text="Edit"
    negative-text="Cancel"
    @positive-click="editProfessor"
    @negative-click="cancel"
  >
    Name:
    <n-input v-model:value="professorName" placeholder="Professor Name" />
    Email:
    <n-input v-model:value="professorEmail" placeholder="Professor Email" />
    Phone:
    <n-input v-model:value="professorPhone" placeholder="Professor Phone" />
  </n-modal>
</template>
