$(document).ready(function(){
    $('.delete-article').on('click',function(e){
        $target=$(e.target);
        let id=$target.attr('data-id');
        $.ajax({
            type:'DELETE',
            url:'/articles/delete/' + id,
            success:function(response){
                alert("Deleting Article");
                window.location.href='/';
            },
            error:function(err){
                console.log(err);
            }
        });
    });
});