import Service from '@ember/service';

export default Service.extend({
  names: {
    1: "",
    2: "bis",
    3: "ter",
    4: "quater",
    5: "quinquies",
    6: "sexies",
    7: "septies",
    8: "octies",
    9: "novies",
    10: "decies"
  },

  createVersionName: function(number){
    let name = this.names[number];
    if(typeof name === "undefined"){
      return `${number || ""}`;
    }else{
      return name;
    }
  }
});
