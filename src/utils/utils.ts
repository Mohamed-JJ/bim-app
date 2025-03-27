// import * as OBC from "@thatopen/components";

export const downloadFile = (blob: Blob, filename: string) => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export function readFile(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event!.target?.result);
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

export function download(file: File) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function triggerFileUpload() {
  const fileInput = document.getElementById("ifc-file-input");
  if (fileInput) {
    fileInput.click();
  } else {
    console.error("File input element not found");
  }
  // console.log("here at trigger")
}

// retrival and login
// async function logStuff(componentsRef: ref<OBC.Components | null>, last_modelRef, fragmentID) {
//   var model = last_modelRef.value;
//   console.log("[LOGSTUFF] model ", model);
//   const _indexer = componentsRef.value.get(OBC.IfcRelationsIndexer);
//   await _indexer.process(model);

//   const psets = _indexer.getEntityRelations(model, fragmentID, "IsDefinedBy");
//   const somets = _indexer.getEntityRelations(
//     model,
//     fragmentID,
//     "IsTypedBy"
//   );

//   console.log("[INDEXER] psets : ", psets);
//   if (psets) {
//     for (const expressID of psets) {
//       console.log(
//         "=================================\n================================="
//       );
//       // You can get the pset attributes like this
//       const pset = await model.getProperties(expressID);
//       // You can get the pset props like this or iterate over pset.HasProperties yourself
//       await OBC.IfcPropertiesUtils.getPsetProps(
//         model,
//         expressID,
//         async (propExpressID: unknown) => {
//           const prop = await model.getProperties(propExpressID);
//           if (prop != null) {
//             console.log(
//               "[INDEXER] Name = ",
//               prop.Name?.value,
//               ", Nominal value = ",
//               prop.NominalValue?.value,
//               ", expressID",
//               expressID
//             );
//           } else {
//             console.log("[INDEXER] prop null", propExpressID);
//           }
//         }
//       );
//     }
//   }

//   console.log(
//     "=========================== big divider between ==========================="
//   );
//   console.log("[INDEXER] somets : ", somets);

//   if (somets) {
//     const properties = [];
//     console.log("the model:", model)
//     for (const expressID of somets) {
//       console.log(
//         "=================================\n================================="
//       );
//       // You can get the pset attributes like this
//       const pset = await model.getProperties(expressID);
//       console.log("the pset in types:", pset.expressID);
//       if (!pset) continue;
//       const stuff = await _indexer.getEntityChildren(
//         model,
//         expressID
//       );
//       console.log("stuuf from the entity children",stuff)
//       for (const s of stuff) {
//         const p = await model.getProperties(s);
//         console.log("the return data from get property", p)
//       }
//     }
//   }
// }