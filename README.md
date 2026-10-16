# Declaration of Innovation

**A declaration for people who gather to make, and make things better.**

The Declaration of Innovation is an open, remixable community charter for groups that gather to build things, share knowledge, and strengthen relationships. It is meant for meetups, coffee gatherings, hack nights, workshops, peer circles, conferences, and any project that wants a shared foundation for how people treat one another.

## Use It

- Read the declaration: [declarationofinnovation.org](https://declarationofinnovation.org/)
- Download the markdown template: [`declaration.md`](declaration.md)

## Adapt It

Fork this repo, copy `declaration.md`, and add your community's local commitments. See `examples/` for how two communities have adapted it:

- [`examples/mondaiy-coffee.md`](examples/mondaiy-coffee.md) — Weekly AI coffee in Atlanta, GA
- [`examples/free-parking.md`](examples/free-parking.md) — Monthly CEO peer circle in Atlanta, GA

## Sign It

Use the [form on the site](https://declarationofinnovation.org/#sign). No account is needed. Sign as a person, or as a community or group to join the communities list. Add your name, location, one sentence about the bond you are strengthening, and a link if you like.

If you prefer GitHub, open an issue instead: [sign as a person](https://github.com/agautsc/declaration-of-innovation/issues/new?template=sign.yml) or [add your community](https://github.com/agautsc/declaration-of-innovation/issues/new?template=add-community.yml).

### How signatures get published

Every signature becomes a GitHub issue labeled `signature` or `community`. Form signatures are filed by the endpoint in [`worker/`](worker/). A maintainer adds the `approved` label, and the [Sync signatures](.github/workflows/sync-signatures.yml) workflow rebuilds `signatures.json`, which the site reads. To take a signature down, remove the label.

## Show It

Signatories can add a one-line footer to their site. Copy it as-is — it inherits your site's fonts and colors:

```html
<!-- Declaration of Innovation — signatory footer -->
<p style="margin: 1.5em 0 0; font-size: 0.9em;">
  <em>&#8220;When it becomes necessary to strengthen the community bonds&#8230;&#8221;</em>
  &#8212; <a href="https://declarationofinnovation.org/" style="color: inherit;">signatory of the Declaration of Innovation</a>
</p>
```

## License

[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Copy, adapt, sign, and improve — just keep a line crediting the Declaration of Innovation.
