const typePropsExtractor =(types: unknown)=> {
    const pset = [];
    for (const expressID of types) {
      const pse = await model.getProperties(expressID);
      // console.log(pse);
      for (const IdEx of pse.HasPropertySets) {
        const pet = await model.getProperties(IdEx.value);
        await OBC.IfcPropertiesUtils.getPsetProps(
          model,
          pet.expressID,
          async (propExpressID) => {
            const prop = await model.getProperties(propExpressID);
            if (prop != null) {
              console.log("the prop is: ", prop)
            } else {
              console.log("[INDEXER] prop null", propExpressID);
            }
          }
        );
      }
    }
    return pset
}