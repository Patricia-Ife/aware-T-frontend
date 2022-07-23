<!-- Home -->

<template>
  <div id="chart">
    <div v-for="semester in current_semesters">
      <h1>
        Nombre d'heures de cours par professeur pour le {{ semester.name }}
      </h1>
      <apexchart
        :key="semester.id"
        type="bar"
        height="350"
        width="600"
        :options="Object.assign({}, chartOptions[semester.id])"
        :series="[...series[semester.id]]"
      ></apexchart>
    </div>

    <div class="export-button">
      <n-button type="primary" @click="exportpdf">Exporter en PDF</n-button>
    </div>
    <table v-for="semester in current_semesters" :id="semester.id">
      <tr>
        <td colspan="5">
          <b
            >Proposition: honoraires des vacations de la Filiere ICT4D_{{
              semester.name
            }}_{{year - 1}}_{{year}}</b
          >
        </td>
      </tr>
      <tr>
        <td><b>N</b></td>
        <td><b>Noms et Prenoms</b></td>
        <td><b>Course</b></td>
        <td><b>Volume</b></td>
        <td><b>Total</b></td>
      </tr>
      <template
        v-for="(professor, pi) in professors.filter((professor) =>
          professor.courses.some((course) => course.semester_id == semester.id)
        )"
      >
        <tr
          v-for="(course, ci) in professor.courses.filter(
            (c) => c.semester_id == semester.id
          )"
        >
          <td
            v-if="ci == 0"
            :rowspan="
              professor.courses.filter((c) => c.semester_id == semester.id)
                .length
            "
          >
            {{ pi + 1 }}
          </td>
          <td
            v-if="ci == 0"
            :rowspan="
              professor.courses.filter((c) => c.semester_id == semester.id)
                .length
            "
          >
            {{ professor.name }}
          </td>
          <td>{{ course.name }}</td>
          <td>
            {{
              course.presences
                .filter((p) => p.professor_id == professor.id)
                .reduce((a, p) => a + parseFloat(p.duration), 0)
            }}
          </td>
          <td
            v-if="ci == 0"
            :rowspan="
              professor.courses.filter((c) => c.semester_id == semester.id)
                .length
            "
          >
            {{
              professor.courses
                .filter((c) => c.semester_id == semester.id)
                .reduce(
                  (a, c) =>
                    a +
                    c.presences
                      .filter((p) => p.professor_id == professor.id)
                      .reduce((a, p) => a + parseFloat(p.duration), 0),
                  0
                )
            }}
          </td>
        </tr>
      </template>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useMessage } from "naive-ui";
import ky from "ky";
import { api } from "../utils";
import html2canvas from "html2canvas";
import JsPDF from "jspdf";

const message = useMessage();

const year = ref("")
const chartOptions = ref({});
const series = ref([]);
const professors = ref([]);
const current_semesters = ref([]);

onMounted(async () => {
  year.value = new Date().getFullYear();
  const semesters = await api.get("semester").json();
  current_semesters.value = semesters
    .filter((s) => s.year.name == year.value)
    .sort((a, b) => a.id - b.id);
  const presences = await api.get("presence").json();
  professors.value = await api.get("professor").json();
  let stats = {};
  current_semesters.value.forEach((semester) => {
    stats[semester.id] = {};
    professors.value.forEach((professor) => {
      if (!(professor.name in stats)) {
        stats[semester.id][professor.name] = 0;
      }
      const professor_presences = presences.filter(
        (presence) =>
          presence.professor.id === professor.id &&
          presence.course.semester_id === semester.id
      );
      if (professor_presences.length !== 0) {
        let duration = 0;
        professor_presences.forEach((p) => {
          duration += parseInt(p.duration);
        });
        stats[semester.id][professor.name] = duration;
      }
    });
  });

  for (const [key, value] of Object.entries(stats)) {
    chartOptions.value[key] = {
      chart: {
        height: 350,
        type: "bar",
      },
      plotOptions: {
        bar: {
          columnWidth: "45%",
          distributed: true,
        },
      },
      dataLabels: {
        enabled: true,
      },
      legend: {
        show: false,
      },
      xaxis: {
        categories: Object.keys(value),
        labels: {
          style: {
            fontSize: "12px",
          },
        },
        title: {
          text: "Nom du professeur",
        },
      },
      yaxis: {
        title: {
          text: "Total horaire",
        },
      },
    };
    series.value[key] = [{ name: "Total horaire", data: Object.values(value) }];
  }
});

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
  current_semesters.value.forEach((semester) => {
    let element = document.getElementById(semester.id);
    downloadPDF(element, "statistiques " + semester.name + ".pdf");
  });
};
</script>

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
</style>
