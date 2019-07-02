import Service from '@ember/service';
import $ from 'jquery';
import { inject } from '@ember/service';
import EmberObject from '@ember/object';

export default Service.extend({
	globalError: inject(),
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
		}).catch((err) => {
			this.globalError.showToast.perform(
				EmberObject.create({
					title: "Opgelet",
					message: "Something went wrong with the conversion of the document.",
					type: "error"
				})
			)
			return err
		});
	}
});
