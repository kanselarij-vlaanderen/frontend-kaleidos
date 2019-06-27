import EmberObject from '@ember/object';

export default EmberObject.create({
	phasesCodes: [
		{
			label: "principiële goedkeuring",
		}
	],
	alphabet: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
	OCCaseTypeID: "6f771654-a8be-43e6-9fe5-7e17fed1cb9a",
	VRCaseTypeID: "c3edbd53-db3b-42d8-a18d-75b8a53ba741",
	preparationSubcaseTypeId: "343e05e1-24ca-4cfb-8708-048011c2b741",
	approvalSubcaseTypeId: "7b90b3a6-2787-4b41-8a1d-886fc5abbb33",
	resultSubcaseName: "1ste principiële goedkeuring",
	principalApprovalId: "7b90b3a6-2787-4b41-8a1d-886fc5abbb33",
	onAgendaCodeId: "3e6dba4f-5c3c-439a-993e-92348ec73642",
	decidedCodeId: "4ea2c010-06c0-4594-966b-2cb9ed1e07b7",
	onAgendaLabel: "geagendeerd",
	decidedLabel: "beslist",
	notaID: "9e5b1230-f3ad-438f-9c68-9d7b1b2d875d",
	remarkType:"http://kanselarij.vo.data.gift/id/dossier-types/305E9678-8106-4C14-9BD6-60AE2032D794",
	formallyOkOptions: [
		{
			label: "Formeel OK",
			uri: "http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/CC12A7DB-A73A-4589-9D53-F3C2F4A40636",
			classNames: "vlc-agenda-items-new__status vlc-agenda-items-new__status--positive",
			approved: true,
			pillClassNames: "vlc-pill vlc-pill--success"
		},
		{
			label: "Formeel niet OK",
			uri: "http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/92705106-4A61-4C30-971A-55532633A9D6",
			classNames: "vlc-agenda-items-new__status vl-u-text--error",
			pillClassNames: "vlc-pill vlc-pill--error"
		},
		{
			label: "Nog niet formeel OK",
			uri: "http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/B72D1561-8172-466B-B3B6-FCC372C287D0",
			classNames: "vlc-agenda-items-new__status",
			pillClassNames: "vlc-pill"
		}
	],

	notYetFormallyOk: "http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/B72D1561-8172-466B-B3B6-FCC372C287D0",
	formallyNok: "http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/92705106-4A61-4C30-971A-55532633A9D6",
	formallyOk: "http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/CC12A7DB-A73A-4589-9D53-F3C2F4A40636"

}) 