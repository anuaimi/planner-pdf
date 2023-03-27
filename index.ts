import { jsPDF } from "jspdf";

class AppInputs {
  paperSize: string;
  pageSize: string;
  printDateRange: DateRange;

  constructor() {
    this.paperSize = "a4";
    this.pageSize = "a4";
    this.printDateRange = new DateRange();
  }
}

// PageLayout has all details on the layout of the page
class PaperDetails {
  width: number;
  height: number;
  // left_margin: number;
  // right_margin: number;

  constructor() {
    this.width = 0;
    this.height = 0;
    // this.left_margin = 0;
    // this.right_margin = 0;
  }
}

class PageLayout {
  width: number;            // width of the page 
  height: number;           // height of the page
  left_margin: number;      // 
  right_margin: number;
  offsetForHoles: number;
  holesOnLeft: boolean;

  constructor() {
    this.width = 0;
    this.height = 0;
    this.left_margin = 0;
    this.right_margin = 0;
    this.offsetForHoles = 0;
    this.holesOnLeft = true;
  }
}

class BoundingBox {
  left: number;
  right: number;
  top: number;
  height: number;

  constructor() {
    this.left = 0;
    this.right = 0;
    this.top = 0;
    this.height = 0;
  }
}
class DateRange {
  firstDate: Date;
  lastDate: Date;
  numberOfDays: number;
  firstDay: number;     // day of the first date (0-6)
  lastDay: number;      // day of the last date (0-6)

  constructor() {
    this.firstDate = new Date(2023, 0, 1);      // jan 1st
    this.lastDate = new Date(2023, 0, 1);     // jan 1st
    this.firstDay = this.firstDate.getDay();
    this.lastDay = this.lastDate.getDay();
    this.numberOfDays = 0;
  }

  setRange(firstDate: Date, lastDate: Date) {
    this.firstDate = firstDate;
    this.lastDate = lastDate;
    this.numberOfDays = (this.lastDate.getTime() - this.firstDate.getTime()) / (1000 * 60 * 60 * 24);
    this.firstDay = this.firstDate.getDay();
    this.lastDay = this.lastDate.getDay();

    console.log("firstDate: " + this.firstDate.toString());
    console.log("lastDate: " + this.lastDate.toString());
    console.log("number of days", this.numberOfDays);
    console.log("first day", this.firstDay);
    console.log("last day", this.lastDay);
  }

}

// function display_punch_holes(doc: jsPDF, pageLayout: PageLayout,) 
// {
  // 3 holes 
  // center & 2 3/4" on each side, 0.5 in margin for holes
  // 8.5mm from edge, 108mm between each hole, 7mm diameter hole

  // 6 holes
// }


// header will print the header for the page
function header(doc: jsPDF, pageLayout: PageLayout, sectionHeight: number) {

  // TODO: 
  let leftMargin = 0;
  let rightMargin = 0;

  if (pageLayout.holesOnLeft) {
    leftMargin = pageLayout.left_margin+pageLayout.offsetForHoles;
    rightMargin = pageLayout.width-pageLayout.right_margin;
  } else {
    leftMargin = pageLayout.left_margin;
    rightMargin = pageLayout.width-(pageLayout.right_margin+pageLayout.offsetForHoles);
  }

  const yMargin = sectionHeight * 0.25;

  doc.text("Priorities", leftMargin, yMargin);
  doc.rect(leftMargin, sectionHeight*0.4, 10, 10); 
  doc.rect(leftMargin, sectionHeight*0.55, 10, 10); 
  doc.rect(leftMargin, sectionHeight*0.70, 10, 10); 

  const previousSize = doc.getFontSize();
  doc.setFontSize(24);
  doc.text("July 2023", rightMargin, yMargin, {align:"right"});
  doc.setFontSize(previousSize);
}

// drawDayBox
function drawDayBox(doc: jsPDF, boundingBox: BoundingBox, dateOfMonth: number, dayOfWeek: string) {

  const indent = 7;
  const ySpacing = boundingBox.height * 0.025;

  // line at top
  doc.setLineWidth(0.5);
  doc.line(boundingBox.left, boundingBox.top, boundingBox.right, boundingBox.top); 

  // date and day of week
  doc.setFontSize(20).text(dateOfMonth.toString(), boundingBox.left+indent, boundingBox.top+ySpacing);
  doc.setFontSize(16).text(dayOfWeek, boundingBox.left+indent, boundingBox.top+(ySpacing*2));

}

//  body
function body(doc: jsPDF, pageLayout: PageLayout, sectionYOffset: number, sectionHeight: number) {
 
  let leftMargin = 0;
  let rightMargin = 0;
  if (pageLayout.holesOnLeft) {
    leftMargin = pageLayout.left_margin+pageLayout.offsetForHoles;
    rightMargin = pageLayout.right_margin;
  } else {
    leftMargin = pageLayout.left_margin;
    rightMargin = pageLayout.right_margin+pageLayout.offsetForHoles;
  }
  const centrePoint = pageLayout.width/2;
  const subSectionHeight = sectionHeight * 0.33;
  const ySpacing = sectionHeight * 0.03;

  const indent = 7;

  let boundingBox = {
    left: leftMargin,
    right: pageLayout.width-rightMargin,
    top: sectionYOffset,
    height: sectionYOffset + sectionHeight
  }
  drawDayBox(doc, boundingBox, 27, "Thursday");

  boundingBox.top = sectionYOffset + subSectionHeight;
  drawDayBox(doc, boundingBox, 28, "Friday");

  boundingBox.top = sectionYOffset + subSectionHeight*2;
  boundingBox.right = centrePoint;
  drawDayBox(doc, boundingBox, 29, "Saturday");

  let subSectionYOffset = sectionYOffset + (subSectionHeight*2);
  doc.line(centrePoint, subSectionYOffset, centrePoint, subSectionYOffset+subSectionHeight);

  boundingBox.left = centrePoint;
  boundingBox.right = pageLayout.width-rightMargin;
  drawDayBox(doc, boundingBox, 30, "Sunday");

}

// footer will print the footer for the page
function footer(doc:jsPDF, pageLayout: PageLayout, footerOffset: number) {
  
  const footerHeight = pageLayout.height - footerOffset;
  const footerYCentre = footerOffset + footerHeight/2;

  doc.setFontSize(10);
  doc.text("personal planner for Athir Nuaimi", pageLayout.width/2, footerYCentre, {align: "center"}); 
}

// main
function main() {

  // setup user input for app (as we don't have a UI yet)
  const appInputs = new AppInputs();
  appInputs.paperSize = "letter";
  appInputs.pageSize = "letter";
  appInputs.printDateRange.setRange( new Date(2023, 2, 19), new Date(2023, 2, 27));

  // calculate # of weeks
  const timeDiff = (appInputs.printDateRange.lastDate.getTime() - appInputs.printDateRange.firstDate.getTime());
  const numberOfDays = timeDiff/(1000.0*60*60*24)+1;        // convert from msec to days & add 1 extra day
  const firstDayOfRange = appInputs.printDateRange.firstDate.getDay();
  const lastDayOfRange = appInputs.printDateRange.lastDate.getDay();
  const numberOfWeeks = Math.ceil((appInputs.printDateRange.firstDay + appInputs.printDateRange.numberOfDays) / 7);
  console.log("number of weeks:", numberOfWeeks);

  // create PDF (and 1st page)

  // create the document (with 1st page)
  const pageSize = appInputs.paperSize;       // 'letter' or 'a4'
  const pageUnits = "pt";                     // or 'mm', 'in' or others
  let orientation = 'p';                  // default to portrait
  if (appInputs.pageSize == "a5") {
    orientation = "l";                    // portrait - take up entire paper
  }

  // create the PDF - note, 1st param can't be a string so need to use ?
  const doc = new jsPDF(orientation == 'p' ? 'p' : 'l', pageUnits, pageSize, false);

  // get pager size 
  const paperInfo = doc.getPageInfo(1);
  const paperLayout = new PaperDetails();
  paperLayout.width = paperInfo.pageContext.mediaBox.topRightX;
  paperLayout.height = paperInfo.pageContext.mediaBox.topRightY;
  console.log("paper size:",paperLayout.width, paperLayout.height);

  // set page layout

  // setup page details
  // can be 1 planner page per paper page or 2 planner pages per paper page  
  const pageLayout = new PageLayout();
  pageLayout.width = paperLayout.width;
  pageLayout.height = paperLayout.height;
  pageLayout.left_margin = pageLayout.width*0.02;
  pageLayout.right_margin = pageLayout.width*0.02;
  pageLayout.offsetForHoles = 72*0.8;                 // 72 pt/in & want 0.8" offset
  
  const headerHeight = paperLayout.height * 0.15;
  const bodyHeight = paperLayout.height * 0.80;
  const footerOffset = paperLayout.height * 0.95;

  // start generating the pages
  let pageNumber = 0;
  let currentDate = appInputs.printDateRange.firstDate
  for (let week = 1; week <= numberOfWeeks; week++) {


    const day = currentDate.getDay();
    console.log("current day: ", day);

    // see if current week includes M T or W
    // only print if 
    if ((day <= 2) && (week == 1) || (week > 1)){
      
      if (pageNumber > 0) {
        doc.addPage();
      } 

      // start with 1st (left) page
      console.log("printing left page for week ", week);
      console.log(currentDate.toString());
  
      // header(doc, paperLayout, pageUnits, currentDate);
      // body(doc, paperLayout, pageUnits, pageUnits, currentDate);
      // footer(doc, paperLayout, pageUnits, currentDate);
      
      // USE DATE TO CUSTOMIZE

      header(doc, pageLayout, headerHeight+1);
      body(doc, pageLayout, headerHeight, bodyHeight);
      footer(doc, pageLayout, footerOffset);

      pageNumber += 1;
    }
    
    if ((week < numberOfWeeks) || (lastDayOfRange > 2) && (week == numberOfWeeks)) {
      // print 2nd (right) page 
      if (pageNumber > 0) {
        doc.addPage();

        // USE DATE TO CUSTOMIZE

        header(doc, pageLayout, headerHeight+1);
        body(doc, pageLayout, headerHeight, bodyHeight);
        footer(doc, pageLayout, footerOffset);

      } 
      console.log("printing right page for week ", week);
      pageNumber += 1;
    }

    currentDate.setDate( currentDate.getDate() + 7);
    console.log("new date: ", currentDate.toString())
  }
  console.log(pageNumber, " total pages");

  // setup page details
  // header(doc, pageLayout, headerHeight+1);
  // body(doc, pageLayout, headerHeight, bodyHeight);
  // footer(doc, pageLayout, footerOffset);

  // save the PDF to disk
  doc.save("letter-landscape.pdf");
}

main();
