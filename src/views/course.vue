<script setup>
import { ref, h, onMounted } from "vue";
import { useMessage, NButton, NSpace, NTag } from "naive-ui";
import ky from "ky";
import { api } from "../utils";
import router from "../router";

const showCreateModal = ref(false);
const showEditModal = ref(false);
const courseName = ref("");
const courseTitle = ref("");
const courseSyllabus = ref("");
const courseProfessors = ref([]);
const courseLevel = ref(null);
const courseLevelOptions = ref([]);
const courseSemester = ref(null);
const courseSemesterOptions = ref([]);
const courseProfessorsOptions = ref([]);
const editCourseId = ref("");
const message = useMessage();

const fetchData = async () => {
  data.value = await api.get("course").json();
  const levels = await api.get("level").json();
  const semesters = await api.get("semester").json();
  const professors = await api.get("professor").json();
  courseLevelOptions.value = levels.map((level) => ({
    label: level.name,
    value: level.id,
  }));
  courseSemesterOptions.value = semesters.map((semester) => ({
    label: semester.name + " " + semester.year.name,
    value: semester.id,
  }));
  courseProfessorsOptions.value = professors.map((professor) => ({
    label: professor.name,
    value: professor.id,
  }));
};

const cancel = () => {
  message.success("Cancel");
};
const createCourse = async () => {
  const options = {
    json: {
      name: courseName.value,
      title: courseTitle.value,
      syllabus: courseSyllabus.value,
      level_id: courseLevel.value,
      semester_id: courseSemester.value,
      professors: JSON.stringify(courseProfessors.value),
    },
  };

  const course = await api.post("course", options).json();
  message.success("Course created successfully");
  await fetchData();
};
const editCourse = async (course) => {
  const options = {
    json: {
      name: courseName.value,
      title: courseTitle.value,
      syllabus: courseSyllabus.value,
      level_id: courseLevel.value,
      semester_id: courseSemester.value,
      professors: JSON.stringify(courseProfessors.value),
    },
  };

  const result = await api.put("course/" + editCourseId.value, options).json();
  message.success("Course edited successfully");
  await fetchData();
};

const deleteCourse = async (course) => {
  const result = await api.delete("course/" + course.id).json();
  message.success("Course deleted successfully");
  await fetchData();
};

const columns = [
  {
    title: "Name",
    key: "name",
    render(row) {
      return h(
        "a",
        {
          onClick: () => {
            router.push("/course/" + row.id);
          },
          style: {
            cursor: "pointer",
            color: "hotpink"
          },
        },
        {
          default: () => row.name,
        }
      );
    },
  },
  {
    title: "Title",
    key: "title",
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
    title: "Semester",
    key: "semester",
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
          default: () => row.semester.name + " " + row.semester.year.name,
        }
      );
    },
  },
  {
    title: "Professors",
    key: "professors",
    render(row) {
      const professors = row.professors.map((professor) => {
        return h(
          NTag,
          {
            style: {
              marginRight: "6px",
            },
            type: "info",
          },
          {
            default: () => professor.name,
          }
        );
      });
      return professors;
    },
  },
  {
    title: "Appreciation",
    key: "appreciation",
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
          default: () => row.appreciation,
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
                  courseName.value = row.name;
                  courseTitle.value = row.title;
                  courseSyllabus.value = row.syllabus;
                  courseLevel.value = row.level.id;
                  courseSemester.value = row.semester.id;
                  courseProfessors.value = row.professors.map(
                    (professor) => professor.id
                  );
                  editCourseId.value = row.id;
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
                onClick: () => deleteCourse(row),
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
        Add Course
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
    title="Create a course"
    positive-text="Submit"
    negative-text="Cancel"
    @positive-click="createCourse"
    @negative-click="cancel"
  >
    Name:
    <n-input v-model:value="courseName" placeholder="Name" />
    Title:
    <n-input v-model:value="courseTitle" placeholder="Title" />
    Level:
    <n-select
      v-model:value="courseLevel"
      :options="courseLevelOptions"
      placeholder="Level"
    />
    Semester:
    <n-select
      v-model:value="courseSemester"
      :options="courseSemesterOptions"
      placeholder="Semester"
    />
    Professors:
    <n-select
      v-model:value="courseProfessors"
      multiple
      :options="courseProfessorsOptions"
      placeholder="Professors"
    />
    Syllabus:
    <n-input
      v-model:value="courseSyllabus"
      type="textarea"
      placeholder="Syllabus"
    />
  </n-modal>
  <n-modal
    v-model:show="showEditModal"
    preset="dialog"
    title="Edit a course"
    positive-text="Edit"
    negative-text="Cancel"
    @positive-click="editCourse"
    @negative-click="cancel"
  >
    Name:
    <n-input v-model:value="courseName" placeholder="Name" />
    Title:
    <n-input v-model:value="courseTitle" placeholder="Title" />
    Level:
    <n-select
      v-model:value="courseLevel"
      :options="courseLevelOptions"
      placeholder="Level"
    />
    Semester:
    <n-select
      v-model:value="courseSemester"
      :options="courseSemesterOptions"
      placeholder="Semester"
    />
    Professors:
    <n-select
      v-model:value="courseProfessors"
      multiple
      :options="courseProfessorsOptions"
      placeholder="Professors"
    />
    Syllabus:
    <n-input
      v-model:value="courseSyllabus"
      type="textarea"
      placeholder="Syllabus"
    />
  </n-modal>
</template>
