$( document ).ready(function() {
  editor = new $.fn.dataTable.Editor( {
		ajax: "/catalog/book_board_list",
		table: "#example",
		idSrc: "_id",
		fields: [ {
				label: "Title:",
				name: "title",
				type: "readonly"
			}, {
				label: "Word Count:",
				name: "wcnt"
			}, {
				label: "Lexile:",
				name: "lexile"
			}, {
				label: "Level:",
				name: "level"
			}, {
				label: "Progress:",
				name: "progress"
			}, {
				label: "Read Count:",
				name: "rcnt"
			}, {
				label: "Start Date:",
				name: "start_date",
				type:  "datetime",
				def:   function () { return new Date(); }
			}, {
				label: "End Date:",
				name: "end_date",
				type:  "datetime",
				def:   function () { return new Date(); }
			}, {
				label: "Create Date:",
				name: "create_date",
				type:  "datetime",
				def:   function () { return new Date(); }
			}
		]
	} );

	var table = $("#example").DataTable( {
		lengthChange: true,
		lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
		dom: "Bfrtip",
		processing: true,
    serverSide: true,
		ajax: {
			type: "POST",
		 	url: "/catalog/book_board_list"
		 },
		order: [10, 'desc'],
		columns: [
			{ data: "rownum", orderable: false },
      { data: "title", defaultContent: "" },
      { data: "author", defaultContent: "" },
			{ data: "wcnt", defaultContent: "" },
			{ data: "lexile", defaultContent: "" },
			{ data: "level", defaultContent: "" },
			{ data: "progress", defaultContent: "" },
      { data: "rcnt", defaultContent: "" },
      { data: "start_date", defaultContent: "" },
      { data: "end_date", defaultContent: "" },
			{ data: "create_date", defaultContent: "" }
		],
		columnDefs: [ {
			"targets": 1,
			"data": "title",
			"render": function ( data, type, row, meta ) {
				return '<a href="/catalog/book/'+row._id+'">'+data+'</a>';
			}
		},{
			"targets": 3,
			"data": "wcnt",
			"render": function ( data, type, row, meta ) {
        if(typeof row.wcnt != "undefined") {
					return '<a href="/catalog/word_board_list?book_id='+row._id+'">'+data+'</a>';
				} else {
					return '';
				}
			}
		} ],
		select: true,
		buttons: [
			{ extend: "create", editor: editor },
			{ extend: "edit",   editor: editor },
			{ extend: "remove", editor: editor },
			{ extend: "pageLength", editor: editor },
			{
				extend: "collection",
				text: "Export",
				buttons: [
					"copy",
					"excel",
					"csv",
					"pdf",
					"print"
				],
				editor: editor
			}
		],
		initComplete : function() {
				$('#example_filter input').addClass('form-control');
				$('#example_filter input').addClass('form-control-sm');
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
