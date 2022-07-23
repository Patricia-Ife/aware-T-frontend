<script setup>
import { ref, h, onMounted } from "vue";
import { useMessage, NButton, NSpace, NTag } from "naive-ui";
import ky from "ky";
import { api } from "../utils";

const showCreateModal = ref(false);
const showEditModal = ref(false);
const userName = ref("");
const userEmail = ref("");
const userPassword = ref("");
const userRole = ref(null);
const userRoleOptions = ref([]);
const userLevel = ref(null);
const userLevelOptions = ref([]);
const editUserId = ref("");
const message = useMessage();

const fetchData = async () => {
  data.value = await api.get("user").json();
  const levels = await api.get("level").json();
  userLevelOptions.value = levels.map((level) => ({
    label: level.name,
    value: level.id,
  }));
  userRoleOptions.value = [
    { label: "Admin", value: "admin" },
    { label: "Delegue", value: "delegate" },
  ];
};

const cancel = () => {
  message.success("Cancel");
};
const createUser = async () => {
  const options = {
    json: {
      name: userName.value,
      email: userEmail.value,
      password: userPassword.value,
      role: userRole.value,
      level_id: userLevel.value,
    },
  };

  const user = await api.post("register", options).json();
  message.success("User created successfully");
  await fetchData();
};
const editUser = async (user) => {
  const options = {
    json: {
      name: userName.value,
      email: userEmail.value,
      password: userPassword.value,
      role: userRole.value,
      level_id: userLevel.value,
    },
  };

  const result = await api.put("user/" + editUserId.value, options).json();
  message.success("User edited successfully");
  await fetchData();
};

const deleteUser = async (user) => {
  const result = await api.delete("user/" + user.id).json();
  message.success("User deleted successfully");
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
    title: "Role",
    key: "role",
  },
  {
    title: "Level",
    key: "level",
    render(row) {
      return row.level
        ? h(
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
          )
        : "";
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
                  console.log(row)
                  userName.value = row.name;
                  userEmail.value = row.email;
                  userRole.value = row.role;
                  userLevel.value = row.level_id;
                  editUserId.value = row.id;
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
                onClick: () => deleteUser(row),
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
        Add User
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
    title="Create a user"
    positive-text="Submit"
    negative-text="Cancel"
    @positive-click="createUser"
    @negative-click="cancel"
  >
    Name: <n-input v-model:value="userName" placeholder="Name" />
    Email: <n-input v-model:value="userEmail" placeholder="Email" />
    Password: <n-input v-model:value="userPassword" type="password" placeholder="Password" />
    Role:
    <n-select
      v-model:value="userRole"
      :options="userRoleOptions"
      placeholder="User Role"
    />
    Level:
    <n-select
      v-model:value="userLevel"
      :options="userLevelOptions"
      placeholder="User Level"
    />
  </n-modal>
  <n-modal
    v-model:show="showEditModal"
    preset="dialog"
    title="Edit a user"
    positive-text="Edit"
    negative-text="Cancel"
    @positive-click="editUser"
    @negative-click="cancel"
  >
    Name: <n-input v-model:value="userName" placeholder="Name" />
    Email: <n-input v-model:value="userEmail" placeholder="Email" />
    Password: <n-input v-model:value="userPassword" type="password" placeholder="Password" />
    Role:
    <n-select
      v-model:value="userRole"
      :options="userRoleOptions"
      placeholder="User Role"
    />
    Level:
    <n-select
      v-model:value="userLevel"
      :options="userLevelOptions"
      placeholder="User Level"
    />
  </n-modal>
</template>
