## Running Next.js on CoderPad

This pad is running a Next.js app. Changes are automatically captured as you type them, and other people in the Pad can see them. You can add as many files to the project as you need, as well as any NPM packages.

To get started, edit the `app/page.tsx` file, and see your changes reload on the right.

### TypeScript

The app is pre-configured to support TypeScript, but you can define .js and .jsx files instead.

### IntelliSense

IntelliSense is running across your entire project, allowing you to see when there are syntax errors or to get quick hints for how to resolve errors or TypeScript issues.

### Shell

A shell is provided to you so you can inspect your container in more detail. The shell can be used to install NPM packages using `npm install <package>`. In addition to installing packages, the shell can be used for executing a test suite if you have one defined.

**Note: while it's possible to edit files directly from the shell, we recommend using the editor to make your changes. That way, other people in the Pad can see your changes as they're being made.**

### Hot Module Reloading

Next.js provides Hot Module Reloading by default, meaning that changes you make to the files in your project are automatically applied (after a 2 second debounce); there is no need to refresh the iframe to see the changes. Next.js will display any errors directly in the application output, or if there is a system-wide error, in the Logs.

### Container Limits

The container running your application has a few limitations. Currently, we don't limit your CPU usage, though this may change in future. In addition to CPU, we monitor the network bandwidth that is consumed, and limit you to 75mb for the duration of the container. Finally, we limit the amount of memory accessible to each container to 2 GB.

### Assets

To add svg assets, copy them to the `public/` directory. You can add them via drag and drop or manual file creation.
