$( document ).ready(function() {
  editor = new $.fn.dataTable.Editor( {
		ajax: "/catalog/word_board_list",
		table: "#example",
		idSrc: "_id",
		fields: [ {
				label: "Title:",
				name: "title"
			}, {
				label: "Content:",
				name: "content"
			}, {
				label: "Book:",
				name: "book_title",
				type: "readonly"
			}, {
				label: "Story:",
				name: "story_title",
				type: "readonly"
			}, {
				label: "Skill:",
				name: "skill",
				type:  "select",
				options: [
						{ label: "모름", value: "1" },
						{ label: "몇번봄", value: "2" },
						{ label: "익숙함", value: "3" },
						{ label: "기억완료", value: "4" }
				]
			}, {
				label: "Importance:",
				name: "importance",
				type:  "select",
				options: [
						{ label: "중요도없음", value: "1" },
						{ label: "중요", value: "2" },
						{ label: "매우중요", value: "3" },
						{ label: "필수", value: "4" }
				]
			}, {
				label: "Registered date:",
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
			 url: "/catalog/word_board_list",
			 data: function ( d ) {
				d.book_id = $("#book_id").val();
			 }
		 },
		order: [7, 'desc'],
		columns: [
			{ data: "rownum", orderable: false },
      { data: "title", defaultContent: "" },
			{ data: "content", defaultContent: "" },
			{ data: "book_title", defaultContent: "" },
			{ data: "story_title", defaultContent: "" },
			{ data: "skill", defaultContent: "" },
			{ data: "importance", defaultContent: "" },
			{ data: "create_date", defaultContent: "" }
		],
		columnDefs: [ {
			"targets": 3,
			"data": "book_title",
			"render": function ( data, type, row, meta ) {
				if(row.book != null && row.book._id != null && typeof row.book_title != "undefined") {
					return '<a href="/catalog/book/'+row.book._id+'">'+data+'</a>';
				} else {
					return '';
				}
			}
		},{
			"targets": 4,
			"data": "story_title",
			"render": function ( data, type, row, meta ) {
				//console.log(row);
				//console.log(row._id);
				//console.log(row.story._id);
				if(row.story != null && row.story._id != null && typeof row.story_title != "undefined") {
					return '<a href="/catalog/story/'+row.story._id+'">'+data+'</a>';
				} else {
					return '';
				}
			}
		}, {
			"targets": 5,
			"data": "skill",
			"render": function ( data, type, row, meta ) {
				if (data=='1') {
					return '모름';
				} else if (data=='2') {
					return '몇번봄';
				} else if (data=='3') {
					return '익숙함';
				} else if (data=='4') {
					return '기억완료';
				} else {
					return '';
				}
			}
		}, {
			"targets": 6,
			"data": "importance",
			"render": function ( data, type, row, meta ) {
				if (data=='1') {
					return '중요도없음';
				} else if (data=='2') {
					return '중요';
				} else if (data=='3') {
					return '매우중요';
				} else if (data=='4') {
					return '필수';
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
				]
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