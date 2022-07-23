<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useMessage, NButton, NSpace, NTag } from "naive-ui";
import { api } from "../utils";

import html2canvas from "html2canvas";
import JsPDF from "jspdf";

const route = useRoute();
const data = ref(null);
const user = ref(null);
const syllabus_parcouru = ref("");
const syllabus_attendu = ref("");
const remark = ref("");
const appreciation = ref("");
const message = useMessage();

const fetchData = async () => {
  data.value = await api.get("course/" + route.params.id).json();
  remark.value = data.value.remark;
  appreciation.value = data.value.appreciation;
  const presences = await api.get("presence").json();
  syllabus_parcouru.value = presences
    .filter((presence) => presence.course.id == route.params.id)
    .sort((a, b) => a.id - b.id)
    .reduce((a, p) => a + "<br />" + p.content, "")
    .replace(/\n\r?/g, "<br />");
  syllabus_attendu.value = data.value.syllabus.replace(/\n\r?/g, "<br />");
};

const save = async () => {
  const options = {
    json: {
      ...(remark.value && { remark: remark.value }),
      ...(appreciation.value && { appreciation: appreciation.value }),
    },
  };

  const result = await api.put("course/" + route.params.id, options).json();
  message.success("Course edited successfully");
  await fetchData();
};

const appreciationClick = (value) => {
  appreciation.value = value;
};

onMounted(async () => {
  await fetchData();
});
</script>

<template>
  <div id="print">
    <div class="container">
      <h1 style="margin-top: 50px">
        APPRECIATION DU COURS {{ data ? data.name : "" }}
      </h1>
      <table>
        <tr>
          <td>
            <b>Syllabus Parcouru</b>
          </td>
          <td>
            <b>Syllabus Attendu</b>
          </td>
        </tr>
        <tr>
          <td class="contenu-body" v-html="syllabus_parcouru"></td>

          <td class="contenu-body" v-html="syllabus_attendu"></td>
        </tr>
      </table>

      <h2 style="margin-top: 50px">OBSERVATIONS</h2>

      <n-button-group class="bg">
        <n-button round @click="appreciationClick('tres bien')">
          Tres Bien
        </n-button>
        <n-button round @click="appreciationClick('bien')"> Bien </n-button>
        <n-button round @click="appreciationClick('lent')"> Lent </n-button>
        <n-button round @click="appreciationClick('mauvais')">
          Mauvais
        </n-button>
      </n-button-group>
      <n-input
        class="remark"
        v-model:value="remark"
        type="textarea"
        placeholder="Remarques..."
      />
      <div class="save-button">
        <n-button type="primary" @click="save"> Sauvegarder </n-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
table {
  table-layout: fixed;
  width: 750px;
  border-collapse: collapse;
  border: 1px solid black;
  margin-bottom: 40px;
  margin-top: 10px;
}

td {
  border: 1px solid black;
  text-align: center;
}

.container {
  display: grid;
  place-items: center;
  /* width: 800px; */
}

.contenu-body {
  height: 350px;
  text-align: center;
}

.bg {
  display: grid;
  place-items: stretch;
  grid-template-columns: repeat(4, 1fr);
  column-gap: 20px;
  margin-bottom: 20px;
}

.save-button {
  margin-top: 20px;
}

.remark {
  max-width: 600px;
}
</style>
