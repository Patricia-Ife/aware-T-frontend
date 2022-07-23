<script setup>
import { ref, h, onMounted, watchEffect } from "vue";
import { useMessage, NButton, NSpace, NTag } from "naive-ui";
import ky from "ky";
import { api } from "../utils";
import router from "../router";

const showCreateModal = ref(false);
const showEditModal = ref(false);
const presenceDuration = ref("");
const presenceSession = ref("");
const presenceSessionOptions = ref([
  {
    label: "CM",
    value: "CM",
  },
  {
    label: "TD",
    value: "TD",
  },
  {
    label: "TP",
    value: "TP",
  },
]);
const presenceContent = ref("");
const presenceHall = ref("");
const presenceDate = ref(Date.now());
const presenceSignature = ref(null);
const presenceProfessor = ref(null);
const presenceProfessorsOptions = ref([]);
const presenceCourse = ref(null);
const presenceCoursesOptions = ref([]);
const presenceLevel = ref(null);
const presenceLevelsOptions = ref([]);
const presenceSemester = ref(null);
const presenceSemestersOptions = ref([]);
const presenceStudents = ref([]);
const presenceStudentsOptions = ref([]);
const editPresenceId = ref("");
const signaturePad = ref(null);
const students = ref([]);
const courses = ref([]);
const levels = ref([]);
const semesters = ref([]);
const message = useMessage();

const fetchData = async () => {
  data.value = await api.get("presence").json();
  courses.value = await api.get("course").json();
  students.value = await api.get("student").json();
  levels.value = await api.get("level").json();
  semesters.value = await api.get("semester").json();

  presenceCoursesOptions.value = courses.value.map((course) => ({
    label: course.name,
    value: course.id,
  }));

  presenceLevelsOptions.value = levels.value.map((level) => ({
    label: level.name,
    value: level.id,
  }));
  presenceSemestersOptions.value = semesters.value.map((semester) => ({
    label: semester.name,
    value: semester.id,
  }));
};

watchEffect(() => {
  if (presenceLevel.value || presenceSemester.value) {
    presenceCoursesOptions.value = courses.value
      .filter(
        (course) =>
          course.level.id == presenceLevel.value &&
          course.semester.id == presenceSemester.value
      )
      .map((course) => ({
        label: course.name,
        value: course.id,
      }));
  }
});

watchEffect(() => {
  if (presenceCourse.value) {
    const course = courses.value.find(
      (course) => course.id === presenceCourse.value
    );
    presenceProfessorsOptions.value = course.professors.map((professor) => ({
      label: professor.name,
      value: professor.id,
    }));
    presenceStudents.value = [];
    presenceStudentsOptions.value = students.value
      .filter((student) => student.level.id === course.level.id)
      .map((student) => ({
        label: student.name,
        value: student.id,
      }));
  }
});

const cancel = () => {
  message.success("Cancel");
};
const createPresence = async () => {
  const profile = await api.get("profile").json();
  const date = new Date(presenceDate.value);
  const { isEmpty, data } = signaturePad.value.saveSignature("image/png");
  if (!isEmpty) {
    console.log(data)
    const signature = data.split(',')[1]
    // const res = await fetch(data);
    // const blob = await res.blob();
    // const signature = new File([blob], "Signature", { type: "image/png" });

    const formData = new FormData();
    formData.append(
      "date",
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
    );
    formData.append("duration", presenceDuration.value);
    formData.append("signature", signature);
    formData.append("content", presenceContent.value);
    formData.append("content", presenceContent.value);
    formData.append("hall", presenceHall.value);
    formData.append("session", presenceSession.value);
    formData.append("delegate_id", profile.id);
    formData.append("professor_id", presenceProfessor.value);
    formData.append("course_id", presenceCourse.value);
    formData.append("students", JSON.stringify(presenceStudents.value));

    const presence = await api.post("presence", { body: formData }).json();
    message.success("Presence created successfully");
    showCreateModal.value = false;
    await fetchData();
  } else {
    message.error("Signature is empty");
  }
};

const editPresence = async () => {
  const profile = await api.get("profile").json();

  const date = new Date(presenceDate.value);
  const { isEmpty, data } = signaturePad.value.saveSignature("image/png");
  if (!isEmpty) {
    // const res = await fetch(data);
    // const blob = await res.blob();
    // const signature = new File([blob], "Signature", { type: "image/png" });

    const signature = data.split(',')[1]

    const formData = new FormData();
    formData.append(
      "date",
      date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate()
    );
    formData.append("duration", presenceDuration.value);
    formData.append("signature", signature);
    formData.append("content", presenceContent.value);
    formData.append("hall", presenceHall.value);
    formData.append("session", presenceSession.value);
    formData.append("delegate_id", profile.id);
    formData.append("professor_id", presenceProfessor.value);
    formData.append("course_id", presenceCourse.value);
    formData.append("students", JSON.stringify(presenceStudents.value));

    const result = await api
      .post("presence/" + editPresenceId.value + "?_method=PUT", { body: formData })
      .json();
    message.success("Presence edited successfully");
    showEditModal.value = false;
    await fetchData();
  } else {
    message.error("Signature is empty");
  }
};

const deletePresence = async (presence) => {
  const result = await api.delete("presence/" + presence.id).json();
  message.success("Presence deleted successfully");
  await fetchData();
};

const columns = [
  {
    title: "Date",
    key: "date",
    render(row) {
      return h(
        "a",
        {
          onClick: () => {
            router.push("/presence/" + row.id);
          },
          style: {
            cursor: "pointer",
            color: "hotpink"
          },
        },
        {
          default: () => row.date,
        }
      );
    },
  },
  {
    title: "Duration",
    key: "duration",
  },
  {
    title: "Session",
    key: "session",
  },
  //   {
  //     title: "Signature",
  //     key: "signature",
  //   },
  {
    title: "Professor",
    key: "professor",
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
          default: () => row.professor.name,
        }
      );
    },
  },
  {
    title: "Course",
    key: "course",
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
          default: () => row.course.name,
        }
      );
    },
  },
  {
    title: "Delegate",
    key: "delegate",
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
          default: () => row.delegate.name,
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
                  presenceDate.value = new Date(row.date).getTime();
                  presenceDuration.value = row.duration;
                  presenceContent.value = row.content;
                  presenceHall.value = row.hall;
                  presenceSession.value = row.session;
                  presenceProfessor.value = row.professor.id;
                  presenceCourse.value = row.course.id;
                  presenceStudents.value = row.students.map(
                    (student) => student.id
                  );
                  editPresenceId.value = row.id;
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
                onClick: () => deletePresence(row),
              },
              { default: () => "Delete" }
            ),
          ],
        }
      );
    },
  },
];

const undoSignature = () => {
  signaturePad.value.undoSignature();
};

const data = ref([]);

onMounted(async () => {
  presenceDate.value = new Date().getTime();
  await fetchData();
});

// const rowProps = (row) => {
//   return {
//     style: "cursor: pointer",
//     onClick: () => {
//       router.push("/presence/" + row.id);
//     },
//   };
// };
</script>

<template>
  <n-space vertical :size="12">
    <n-space justify="center">
      <n-button type="primary" @click="showCreateModal = true">
        Add Presence
      </n-button>
    </n-space>
    <n-data-table
      :bordered="false"
      :single-line="false"
      :columns="columns"
      :data="data"
    />
  </n-space>
  <n-modal v-model:show="showCreateModal">
    <n-card
      style="width: 600px"
      title="Create a presence"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      Date:
      <n-date-picker v-model:value="presenceDate" type="date" clearable disabled />
      Duration:
      <n-input-number
        v-model:value="presenceDuration"
        :show-button="false"
        placeholder="Duration"
      >
        <template #suffix> h </template>
      </n-input-number>
      Session:
      <n-select
        v-model:value="presenceSession"
        :options="presenceSessionOptions"
        placeholder="Session"
      />
      Salle:
      <n-input v-model:value="presenceHall" placeholder="Salle" />
      Level:
      <n-select
        v-model:value="presenceLevel"
        :options="presenceLevelsOptions"
        placeholder="Level"
      />
      Semester:
      <n-select
        v-model:value="presenceSemester"
        :options="presenceSemestersOptions"
        placeholder="Semester"
      />
      Course:
      <n-select
        v-model:value="presenceCourse"
        :options="presenceCoursesOptions"
        placeholder="Course"
      />
      Professor:
      <n-select
        v-model:value="presenceProfessor"
        :options="presenceProfessorsOptions"
        placeholder="Professor"
      />
      Content:
      <n-input
        v-model:value="presenceContent"
        type="textarea"
        placeholder="Content"
      />
      Students:
      <n-transfer
        ref="transfer"
        source-title="Absent"
        target-title="Present"
        v-model:value="presenceStudents"
        virtual-scroll
        :options="presenceStudentsOptions"
        filterable
      />
      <div class="undo">
        Signature:
        <n-button @click="undoSignature">Undo</n-button>
      </div>
      <VueSignaturePad
        class="signature"
        width="500px"
        height="100px"
        ref="signaturePad"
      />
      <div class="action-buttons">
        <n-button @click="showCreateModal = false">Cancel</n-button>
        <n-button @click="createPresence" type="primary">Submit</n-button>
      </div>
    </n-card>
  </n-modal>
  <n-modal v-model:show="showEditModal">
    <n-card
      style="width: 600px"
      title="Edit a presence"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      Date:
      <n-date-picker v-model:value="presenceDate" type="date" clearable disabled />
      Duration:
      <n-input-number
        v-model:value="presenceDuration"
        :show-button="false"
        placeholder="Duration"
      >
        <template #suffix> h </template>
      </n-input-number>
      Session:
      <n-select
        v-model:value="presenceSession"
        :options="presenceSessionOptions"
        placeholder="Session"
      />
      Salle:
      <n-input v-model:value="presenceHall" placeholder="Salle" />
      Level:
      <n-select
        v-model:value="presenceLevel"
        :options="presenceLevelsOptions"
        placeholder="Level"
      />
      Semester:
      <n-select
        v-model:value="presenceSemester"
        :options="presenceSemestersOptions"
        placeholder="Semester"
      />
      Course:
      <n-select
        v-model:value="presenceCourse"
        :options="presenceCoursesOptions"
        placeholder="Course"
      />
      Professor:
      <n-select
        v-model:value="presenceProfessor"
        :options="presenceProfessorsOptions"
        placeholder="Professor"
      />
      Content:
      <n-input
        v-model:value="presenceContent"
        type="textarea"
        placeholder="Content"
      />
      Students:
      <n-transfer
        ref="transfer"
        source-title="Absent"
        target-title="Present"
        v-model:value="presenceStudents"
        virtual-scroll
        :options="presenceStudentsOptions"
        filterable
      />
      <div class="undo">
        Signature:
        <n-button @click="undoSignature">Undo</n-button>
      </div>
      <VueSignaturePad
        class="signature"
        width="500px"
        height="100px"
        ref="signaturePad"
      />
      <div class="action-buttons">
        <n-button @click="showEditModal = false">Cancel</n-button>
        <n-button @click="editPresence" type="primary">Edit</n-button>
      </div>
    </n-card>
  </n-modal>
</template>

<style scoped>
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 15px;
}
.signature {
  border: double 3px transparent;
  border-radius: 5px;
  background-image: linear-gradient(white, white),
    radial-gradient(circle at top left, #4bc5e8, #9f6274);
  background-origin: border-box;
  background-clip: content-box, border-box;
}
.undo {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
</style>
