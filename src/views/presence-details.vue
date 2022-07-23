<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { api } from "../utils";

import html2canvas from "html2canvas";
import JsPDF from "jspdf";

const route = useRoute();
const data = ref(null);
const user = ref(null);
const content = ref("");

const fetchData = async () => {
  user.value = await api.get("profile").json();
  data.value = await api.get("presence/" + route.params.id).json();
  content.value = data.value.content.replace(/\n\r?/g, "<br />");
};

const downloadPDF = (ele, pdfName) => {
  let eleW = ele.offsetWidth; // Get the width of the container
  let eleH = ele.offsetHeight; // Get the height of the container
  let eleOffsetTop = ele.offsetTop; // Get the distance from the container to the top of the document
  let eleOffsetLeft = ele.offsetLeft; // Get the leftmost distance from the container to the document
  let canvas = document.createElement("canvas");
  let abs = 0;
  let win_in =
    document.documentElement.clientWidth || document.body.clientWidth; // Gets the width of the current visible window （ No scrollbars ）
  let win_out = window.innerWidth; // Gets the width of the current window （ Include scroll bar ）
  if (win_out > win_in) {
    // abs = (win_o - win_i)/2; // Get half the length of the scroll bar
    abs = (win_out - win_in) / 2; // Get half the width of the scroll bar
    // console.log(a, ' new abs');
  }
  canvas.width = eleW * 2; // Make the canvas wide && High magnification twice
  canvas.height = eleH * 2;
  let context = canvas.getContext("2d");
  context.scale(2, 2);
  context.translate(-eleOffsetLeft - abs, -eleOffsetTop);
  // There is no horizontal scroll bar by default , because offset.left(), There is a difference when there is no scroll bar , therefore
  // translate When , I want to take this difference out
  // html2canvas(element).then( (canvas)=>{ // Report errors
  // html2canvas(element[0]).then( (canvas)=>{

  html2canvas(ele, {
    dpi: 300,
    // allowTaint: true, // allow canvas Pollution , allowTaint The parameters need to be removed , Otherwise, it is impossible to pass toDataURL export canvas Data
    useCORS: true, // allow canvas In canvas You can request external link images across domains , Allow cross domain requests .
  }).then((canvas) => {
    let contentWidth = canvas.width;
    let contentHeight = canvas.height;
    // One page pdf Show html Page generated canvas Height ;
    let pageHeight = (contentWidth / 592.28) * 841.89;
    // Not generated pdf Of html Page height
    let leftHeight = contentHeight;
    // Page migration
    let position = 0;
    //a4 The size of the paper [595.28,841.89],html Page generated canvas stay pdf The width and height of the picture in
    let imgWidth = 595.28;
    let imgHeight = (595.28 / contentWidth) * contentHeight;
    let pageData = canvas.toDataURL("image/jpeg", 1.0);
    let pdf = new JsPDF("", "pt", "a4");
    // There are two heights to distinguish , One is html The actual height of the page , And generation pdf Page height of (841.89)
    // When the content does not exceed pdf The range of one page display , No need to paginate
    if (leftHeight < pageHeight) {
      // stay pdf.addImage(pageData, 'JPEG', Left , On , Width , Height ) Set in the pdf It shows that ;
      pdf.addImage(pageData, "JPEG", 0, 0, imgWidth, imgHeight);
      // pdf.addImage(pageData, 'JPEG', 20, 40, imgWidth, imgHeight);
    } else {
      // Pagination
      while (leftHeight > 0) {
        pdf.addImage(pageData, "JPEG", 0, position, imgWidth, imgHeight);
        leftHeight -= pageHeight;
        position -= 841.89;
        // Avoid adding blank pages
        if (leftHeight > 0) {
          pdf.addPage();
        }
      }
    }
    // It can be generated dynamically
    pdf.save(pdfName);
  });
};

const exportpdf = () => {
  let element = document.getElementById("print");
  downloadPDF(element, "presence.pdf");
};

const exportPresence = () => {
  let element = document.getElementById("presence");
  downloadPDF(element, "liste de presence.pdf");
};

onMounted(async () => {
  await fetchData();
});
</script>

<template>
  <div class="export-button">
    <n-button type="primary" @click="exportpdf">Exporter en PDF</n-button>
  </div>
  <div id="print">
    <div class="container">
      <img width="700" src="../assets/uy1.png" alt="" />
      <h1 style="margin-top: 50px">FICHE DE SUIVI DES ENSEIGNEMENTS</h1>
      <table>
        <tr>
          <td>
            <b>Semester :</b>
            {{ data ? data.course.semester.name : "" }}
          </td>
          <td><b>Date</b>: {{ data ? data.date : "" }}</td>
        </tr>
        <tr>
          <td>
            <b>UE :</b>
            {{ data ? data.course.name : "" }}
          </td>
          <td><b>Total horaire :</b> {{ data ? data.duration + "h" : "" }}</td>
        </tr>
        <tr>
          <td>
            <b>Enseignant :</b>
            {{ data ? data.professor.name : "" }}
          </td>
          <td><b>Delegue :</b> {{ user ? user.name : "" }}</td>
        </tr>
        <tr>
          <td>
            <b>Niveau :</b>
            {{ data ? data.course.level.name : "" }}
          </td>
          <td><b>Salle :</b> {{ data ? data.hall : "" }}</td>
        </tr>
        <tr>
          <td colspan="2">
            <b>Sceance de (CM/TP/TD) :</b> {{ data ? data.session : "" }}
          </td>
        </tr>
        <tr>
          <td class="contenu-title" colspan="2"><b>Contenu</b></td>
        </tr>
        <tr>
          <td class="contenu-body" colspan="2" v-html="content"></td>
        </tr>
      </table>
    </div>
    <div class="signature">
      <span>Signature de l'enseignant</span>
      <img
        width="200"
        height="100"
        :src="data ? 'data:image/png;base64,' + data.signature : ''"
        alt=""
      />
    </div>
  </div>

  <div class="liste">
    <div class="export-button">
      <n-button type="primary" @click="exportPresence"
        >Exporter la liste de presence</n-button
      >
    </div>
    <div id="presence">
      <div class="container">
        <img width="700" src="../assets/uy1.png" alt="" />
        <h1 style="margin-top: 50px">
          LISTE DE PRESENCE {{ data ? data.date : "" }}
        </h1>
        <table>
          <tr>
            <td><b>N</b></td>
            <td><b>Noms et Prenoms</b></td>
            <td><b>Matricule</b></td>
          </tr>
          <tr v-if="data" v-for="(student, index) in data.students">
            <td>{{ index + 1 }}</td>
            <td>{{ student.name }}</td>
            <td>{{ student.matricule }}</td>
          </tr>
        </table>
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

.contenu-title {
  text-align: center;
}

.contenu-body {
  height: 350px;
  text-align: center;
}

.container {
  display: grid;
  place-items: center;
  /* width: 800px; */
}

.signature {
  display: grid;
  place-items: end end;
  /* width: calc(100vw - 750px) / 2 + 750px; */
  margin-right: 30%;
}

.export-button {
  display: grid;
  place-items: end end;
}

.liste {
  margin-top: 150px;
}
</style>
