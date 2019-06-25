import Service from '@ember/service';
import $ from 'jquery';

export default Service.extend({

	convertDocumentVersionById(id) {
		return $.ajax(
			{
				headers: {
					"Accept":"application/json"
				},
				method: "GET",
				url: `/document-versions/${id}/convert`
			}
		).then((result) => {
			return result;
		});
	}
});
