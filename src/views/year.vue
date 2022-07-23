<script setup>
import { ref, h, onMounted } from "vue";
import { useMessage, NButton, NSpace } from "naive-ui";
import ky from "ky";
import { api } from '../utils'

const showCreateModal = ref(false);
const showEditModal = ref(false);
const yearName = ref("");
const editYearId = ref("");
const message = useMessage();

const fetchData = async () => {
  data.value = await api.get("year").json();
};

const cancel = () => {
  message.success("Cancel");
};
const createYear = async () => {
  const options = {
    json: { name: yearName.value },
  };

  const year = await api.post("year", options).json();
  message.success("Year created successfully");
  await fetchData();
};
const editYear = async (year) => {
  const options = {
    json: { name: yearName.value },
  };

  const result = await api.put("year/" + editYearId.value, options).json();
  message.success("Year edited successfully");
  await fetchData();
};

const deleteYear = async (year) => {
  const result = await api.delete("year/" + year.id).json();
  message.success("Year deleted successfully");
  await fetchData();
};

const columns = [
  {
    title: "Name",
    key: "name",
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
                  yearName.value = row.name;
                  editYearId.value = row.id;
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
                onClick: () => deleteYear(row),
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
        Add Year
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
    title="Create a year"
    positive-text="Submit"
    negative-text="Cancel"
    @positive-click="createYear"
    @negative-click="cancel"
  >
    Name: <n-input v-model:value="yearName" placeholder="Year Name" />
  </n-modal>
  <n-modal
    v-model:show="showEditModal"
    preset="dialog"
    title="Edit a year"
    positive-text="Edit"
    negative-text="Cancel"
    @positive-click="editYear"
    @negative-click="cancel"
  >
    Name: <n-input v-model:value="yearName" placeholder="Year Name" />
  </n-modal>
</template>
