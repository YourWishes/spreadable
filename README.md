## Spreadable
A proof-of-concept distributed computing framework written in TypeScript for use
on deno.

This is by no means production ready and has severe security flaws, DO NOT USE.

## Theory
Using various async techniques, attempting to offload procesing of tasks down to
a function level by allowing peers to offer processing of the same codebase and
to use methods such as webhooks, serverless, web workers, etc, to make a widely
distributable computing platform.

Just refer to the PI example I'm working on for now in `examples/pi/`. Basically
you will need to create a HOST and run the MAIN after. When a host is running it
will create a (currently HTTP only) server that can accept function calls and
process them. The MAIN program will (eventually) be able to have multiple peers
and dynamically decide which peers to segment tasks to.

Since this is all P2P, in theory HOST devices can, themselves, have peers that
they in turn can offload work to if they're busy.