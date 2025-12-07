const input = document.querySelector("input");
const preview = document.querySelector(".preview");
const button = document.querySelector(".btn");
const resultElement = document.getElementById("result")
const resultsElement = document.getElementById("results")

input.addEventListener("change", updateImageDisplay);

// Update preview for business card image
function updateImageDisplay() {
    resultsElement.innerHTML = "";
    const files = input.files;
    preview.innerHTML = "";

    for (const file of files) {
        const image = document.createElement("img");
        image.src = URL.createObjectURL(file);
        image.alt = "Image";
        image.style.width = "300px";
        image.style.height = "auto";

        preview.appendChild(image);
    }
    button.classList.add("show");
}

button.addEventListener('click', async () => {
    resultsElement.innerHTML = "";
    const worker = await Tesseract.createWorker();
    const files = input.files;

    try {
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        for (const file of files) {
            //use tesseract worker to do ocr
            const { data: { text } } = await worker.recognize(file);
            const txt = document.createElement("p");
            txt.textContent = text;
            resultsElement.appendChild(txt)

            //extract contact information
            const ol = document.createElement("ol");
            const contacts = {
                name: text.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)\s*[:\-]/) || " Unable to extract name",
                email: text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g) || " Unable to extract email",
                phone: text.match(/(\+\d{1,3}[\s-]?\d{1,4}[\s-]?\d{3,4}[\s-]?\d{3,4})/g) || " Unable to extract phone",
            };

            //display contact information in an ordered list
            for (const key in contacts) {
                const fieldHeader = document.createElement("strong");
                fieldHeader.textContent = key + ":" + contacts[key];

                const liHeader = document.createElement("li");
                liHeader.appendChild(fieldHeader);
                ol.appendChild(liHeader);
            }
            resultsElement.appendChild(ol)

            const query = contacts["name"] !== " Unable to extract name" 
              ? contacts["name"] 
              : contacts["email"];

            const linkedinSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`;

            const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

            //create linkedin search url
            const linkedinlink = document.createElement("a");
            linkedinlink.href = linkedinSearchUrl;
            linkedinlink.target = "_blank";
            linkedinlink.textContent = `Search on LinkedIn`;
            resultsElement.appendChild(linkedinlink);

            //create google search url
            const googlelink = document.createElement("a");
            googlelink.href = googleSearchUrl;
            googlelink.target = "_blank";
            googlelink.textContent = `Search on Google`;
            resultsElement.appendChild(googlelink);

        }
        await worker.terminate();
    } catch (error) {
        resultElement.textContent = `Error during OCR: ${error.message}`;
    }
})