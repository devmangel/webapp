In Next.js 15 (and later versions in the App Router), the params object passed to page and layout components is a Promise, not a direct object. This change was introduced to align with React's concurrent rendering features and allow for more efficient handling of dynamic routes.
Therefore, when accessing properties from params within your components, it is necessary to await the params object to ensure it resolves before its properties are accessed.
Here is an example of how to correctly handle params in a Next.js 15 page component:
Code

// app/your-route/[slug]/page.js
export default async function Page({ params }) {
  const { slug } = await params; // Await params to access its properties

  return (
    <div>
      <h1>Welcome to the {slug} page!</h1>
    </div>
  );
}
Key Points:
Asynchronous Nature: params in Next.js 15's App Router is a Promise, reflecting the asynchronous capabilities of server components and React's concurrent features.
Awaiting for Resolution: The await keyword is crucial to ensure the params Promise resolves, providing access to the dynamic segment values.
Performance Benefits: This asynchronous behavior allows Next.js to potentially start rendering parts of the component before all params are resolved, and then update the rendered output once the parameters become available. 
Error Prevention: Failing to await params will result in an error or unexpected behavior, as you would be attempting to access properties on a Promise object directly.