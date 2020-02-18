$( document ).ready(function() {
  editor = new $.fn.dataTable.Editor( {
		ajax: "/catalog/story_word_datatable_list",
		table: "#searchResults",
		idSrc: "_id",
		fields: [ {
				label: "Sentence:",
				name: "sentence"
			}, {
				label: "Title:",
				name: "title"
			}, {
				label: "Book:",
				name: "btitle",
				type: "readonly"
			}, {
				label: "Registered date:",
				name: "create_date",
				type:  "datetime",
				def:   function () { return new Date(); }
			}
		]
	} );

	var table = $("#searchResults").DataTable( {
		lengthChange: true,
		lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
		dom: "Bfrtip",
		processing: true,
    serverSide: true,
		ajax: {
			type: "POST",
       url: "/catalog/story_word_datatable_list",
       data: function ( d ) {
				d.searchWord = $("#searchWord").val();
			 }
		 },
		order: [4, 'desc'],
		columns: [
			{ data: "rownum", orderable: false },
      { data: "sentence", defaultContent: "" },
			{ data: "title", defaultContent: "" },
			{ data: "btitle", defaultContent: "" },
			{ data: "create_date", defaultContent: "" }
		],
		columnDefs: [ {
			"targets": 2,
			"data": "title",
			"render": function ( data, type, row, meta ) {
        return '<a href="/catalog/story/'+row._id+'">'+data+'</a>';
        
        
			}
		},{
			"targets": 3,
			"data": "btitle",
			"render": function ( data, type, row, meta ) {
				if(row.book != null && row.book._id != null && typeof row.btitle != "undefined") {
					return '<a href="/catalog/book/'+row.book._id+'">'+data+'</a>';
				} else {
					return '';
				}
			}
		} ],
		select: true,
		initComplete : function() {
        $("#searchResults_wrapper").removeClass("dt-buttons");
        $('#searchResults_filter input').addClass('form-control');
				$('#searchResults_filter input').addClass('form-control-sm');
				//$('.dataTables_filter input').addClass("form-control");
				$('.dataTables_filter input').css("width", "300px");
				$('.dataTables_filter input').css("margin-right", "10px");
				var input = $('.dataTables_filter input').unbind(),
						self = this.api(),
						$searchButton = $('<button type="submit" class="btn btn-primary btn-sm" style="margin-right:15px;">')
											.text('search')
											.click(function() {
													self.search(input.val()).draw();
											}),
						$clearButton = $('<button type="submit" class="btn btn-primary btn-sm" style="margin-right:15px;">')
											.text('clear')
											.click(function() {
													input.val('');
													$searchButton.click(); 
											}); 
				$('.dataTables_filter').append($searchButton, $clearButton);
		}
	} );

	table.buttons().container().appendTo( $('.col-lg-12:eq(0)', table.table().container() ) );
    
});