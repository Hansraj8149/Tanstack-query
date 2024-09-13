import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addPost, fetchPosts, fetchTags } from '../api/api'

const PostLists = () => {
  const queryClient = useQueryClient();

  const handleSubmit = (e: any) => {
    e.preventDefault()
    const formData = new FormData(e.target)

    const title = formData.get('title')
    const tags = Array.from(formData.keys()).filter((key) => formData.get(key) === 'on')
    if (!title || !tags) return
    mutate({ id: (postData.length || 0) + 1, title, tags })
    e.target.reset()
  }

  const { data: tagData, isLoading: isTagLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  })

  const { data: postData, isLoading, isError, error } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })

  const { mutate, isPending } = useMutation({
    mutationFn: addPost,
    retry: 3,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['posts'], exact: true })
    },
    onSuccess: (data, variables, context) => {
       queryClient.invalidateQueries({ 
        queryKey: ['posts'], 
        exact: true })
    }
  })

  return (
    <div className="container flex flex-col gap-[10px]">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your post..."
          className="p-[10px] font-[18px] border-r-[5px] border-none border-b-[2px] border-gray-300"
          name="title"
        />
        <div className="flex gap-[10px] p-[5px] ">
          {tagData?.map((tag: any) => (
            <div key={tag}>
              <input name={tag} id={tag} type="checkbox" />
              <label htmlFor={tag}>{tag}</label>
            </div>
          ))}
        </div>
        <button disabled={isPending}>
          {isPending ? 'Posting...' : 'Post'}
        </button>
      </form>

      {isLoading || isTagLoading ? <p>Loading...</p> : null}
      {isError && <p>{error?.message}</p>}

      {/* Safeguard for undefined postData and post.tags */}
      {postData?.map((post: any) => (
        <div key={post.id} className="flex items-center gap-[5px] bg-[#f2fef2] border-r-[5px] p-[10px]">
          <h1 className="font-extrabold">{post.title}</h1>
          {/* Check if tags exist before mapping */}
          {post.tags?.length > 0 ? (
            post.tags.map((tag: any) => (
              <span className="bg-[#cacaca] border-r-[5px] ml-[10px] p-[4px]" key={tag}>
                {tag}
              </span>
            ))
          ) : (
            <span>No tags available</span>
          )}
        </div>
      ))}
    </div>
  )
}

export default PostLists
